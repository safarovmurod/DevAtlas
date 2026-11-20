-- Backend hardening:
--  1. Payment webhook isolation from admin-granted memberships (`source = 'payment'` guards
--     in react_mentor_apply_payment_event, plus one-time cleanup of stale provider fields
--     on any existing admin-granted rows).
--  2. Community media hardening: require an allowed (non-banned, MFA-satisfied) member
--     session in "community media delete own", and reject missing/non-positive object_size
--     in react_mentor_send_post.
--
-- Apply after 20261118000000_community_all_members.sql (and 20261117000000_billing_dodo.sql).
-- Idempotent: safe to run more than once.
begin;

-- 1. Clear stale provider columns left on any existing admin-granted memberships.
update public.react_mentor_memberships
   set provider = null,
       provider_customer_id = null,
       provider_subscription_id = null,
       provider_status = null,
       cancel_at_period_end = false,
       provider_event_at = null
 where source = 'admin'
   and (
     provider is not null
     or provider_customer_id is not null
     or provider_subscription_id is not null
     or provider_status is not null
     or cancel_at_period_end is true
     or provider_event_at is not null
   );

-- 2. Guard react_mentor_apply_payment_event with source = 'payment' so stale provider
--    metadata on an admin grant never causes upgrade conflicts or lets old expiration
--    webhooks revoke an active admin grant.
create or replace function public.react_mentor_apply_payment_event(
  p_webhook_id text,
  p_event_type text,
  p_event_at timestamptz,
  p_user_id uuid,
  p_grant boolean,
  p_tier text,
  p_expires_at timestamptz,
  p_customer_id text,
  p_subscription_id text,
  p_status text,
  p_cancel_at_period_end boolean
) returns text
language plpgsql security definer set search_path = '' as $$
declare
  existing public.react_mentor_memberships%rowtype;
  has_row boolean;
  changed integer;
  old_rank integer;
  new_rank integer;
begin
  if p_webhook_id is null or p_user_id is null or p_subscription_id is null then
    raise exception 'webhook id, user and subscription are required' using errcode = '22023';
  end if;
  if p_grant and (p_tier is null or p_tier not in ('pro', 'expert') or p_expires_at is null) then
    raise exception 'a grant needs a tier and an end date' using errcode = '22023';
  end if;

  insert into public.react_mentor_webhook_events(id, type)
  values (p_webhook_id, left(coalesce(p_event_type, ''), 100))
  on conflict (id) do nothing;
  get diagnostics changed = row_count;
  if changed = 0 then
    return 'duplicate';
  end if;

  -- Two events for one account must not interleave.
  perform pg_advisory_xact_lock(hashtextextended('billing:' || p_user_id::text, 0));
  select * into existing from public.react_mentor_memberships where user_id = p_user_id for update;
  has_row := found;

  if p_grant then
    if has_row then
      if existing.source = 'payment'
         and existing.provider_subscription_id is not distinct from p_subscription_id then
        -- Same paid subscription: an older event never overwrites a newer one.
        if existing.provider_event_at is not null and p_event_at < existing.provider_event_at then
          return 'stale';
        end if;
      elsif existing.expires_at > now() then
        old_rank := case existing.tier when 'expert' then 2 when 'pro' then 1 else 0 end;
        new_rank := case p_tier when 'expert' then 2 else 1 end;
        -- A second paid subscription, or a payment for a lower plan than an admin gift, never
        -- replaces access that is still running. The money is not lost here: the webhook
        -- route logs it so the owner can refund it at the provider.
        if (existing.source = 'payment' and existing.provider_subscription_id is not null)
           or old_rank > new_rank then
          return 'conflict';
        end if;
      end if;
    end if;
    insert into public.react_mentor_memberships(
      user_id, tier, expires_at, updated_at, source, granted_by, granted_at,
      provider, provider_customer_id, provider_subscription_id, provider_status,
      cancel_at_period_end, provider_event_at
    ) values (
      p_user_id, p_tier, p_expires_at, now(), 'payment', null, now(),
      'dodo', p_customer_id, p_subscription_id, p_status,
      coalesce(p_cancel_at_period_end, false), p_event_at
    )
    on conflict (user_id) do update set
      tier = excluded.tier,
      expires_at = excluded.expires_at,
      updated_at = now(),
      source = 'payment',
      granted_by = null,
      granted_at = case
        when public.react_mentor_memberships.source = 'payment'
         and public.react_mentor_memberships.provider_subscription_id
             is not distinct from excluded.provider_subscription_id
          then coalesce(public.react_mentor_memberships.granted_at, excluded.granted_at)
        else excluded.granted_at
      end,
      provider = 'dodo',
      provider_customer_id = excluded.provider_customer_id,
      provider_subscription_id = excluded.provider_subscription_id,
      provider_status = excluded.provider_status,
      cancel_at_period_end = excluded.cancel_at_period_end,
      provider_event_at = excluded.provider_event_at;
    return 'applied';
  end if;

  update public.react_mentor_memberships
     set provider_status = p_status,
         cancel_at_period_end = coalesce(p_cancel_at_period_end, cancel_at_period_end),
         expires_at = case
           when p_expires_at is null then expires_at
           else least(expires_at, p_expires_at)
         end,
         provider_event_at = p_event_at,
         updated_at = now()
   where user_id = p_user_id
     and source = 'payment'
     and provider = 'dodo'
     and provider_subscription_id = p_subscription_id
     and (provider_event_at is null or provider_event_at <= p_event_at);
  get diagnostics changed = row_count;
  if changed = 0 then
    return 'ignored';
  end if;
  return 'applied';
end;
$$;
revoke all on function public.react_mentor_apply_payment_event(
  text, text, timestamptz, uuid, boolean, text, timestamptz, text, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.react_mentor_apply_payment_event(
  text, text, timestamptz, uuid, boolean, text, timestamptz, text, text, text, boolean
) to service_role;

-- 3. Require an active, non-banned, MFA-satisfied session to delete own community media.
drop policy if exists "community media delete own" on storage.objects;
create policy "community media delete own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'community-media'
    and owner_id = (select auth.uid())::text
    and (select public.react_mentor_community_member())
  );

-- 4. Reject missing, non-numeric, zero or negative object_size in react_mentor_send_post.
create or replace function public.react_mentor_send_post(
  post_kind text, post_body text, post_code_language text default null, post_attachment_path text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); display text; message_id uuid; object_mime text; object_size bigint; clean text := coalesce(post_body, '');
begin
  if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode = '42501'; end if;
  if post_kind not in ('text', 'code', 'image', 'video') then raise exception 'Invalid kind' using errcode = '22023'; end if;
  if post_kind in ('text', 'code') then clean := btrim(clean); end if;
  if (post_kind = 'text' and char_length(clean) not between 1 and 2000)
  or (post_kind = 'code' and char_length(clean) not between 1 and 8000)
  or (post_kind in ('image', 'video') and char_length(clean) > 2000)
  or (post_code_language is not null and (post_kind <> 'code' or post_code_language !~ '^[a-z0-9+#-]{1,20}$')) then
    raise exception 'Invalid message' using errcode = '22023';
  end if;
  if post_kind in ('image', 'video') then
    if post_attachment_path is null or post_attachment_path !~ ('^' || uid::text || '/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$') then
      raise exception 'Invalid attachment' using errcode = '22023';
    end if;
    select o.metadata->>'mimetype',
           case when (o.metadata->>'size') ~ '^[0-9]{1,18}$' then (o.metadata->>'size')::bigint end
      into object_mime, object_size
      from storage.objects o
     where o.bucket_id = 'community-media' and o.name = post_attachment_path and o.owner_id = uid::text;
    if object_mime is null
    or object_size is null
    or object_size <= 0
    or (post_kind = 'image' and (object_mime not in ('image/jpeg', 'image/png', 'image/webp') or object_size > 5242880))
    or (post_kind = 'video' and (object_mime not in ('video/mp4', 'video/webm') or object_size > 26214400))
    or exists(select 1 from public.react_mentor_chat_messages where attachment_path = post_attachment_path) then
      raise exception 'Invalid attachment' using errcode = '22023';
    end if;
  elsif post_attachment_path is not null then
    raise exception 'Invalid attachment' using errcode = '22023';
  end if;
  perform public.react_mentor_community_rate_check(uid);
  select display_name into display from public.react_mentor_profiles where user_id = uid;
  if display is null then raise exception 'Profile required' using errcode = '42501'; end if;
  insert into public.react_mentor_chat_messages(author_id, author_name, body, kind, code_language, attachment_path, attachment_mime)
  values (uid, display, clean, post_kind, post_code_language, post_attachment_path, object_mime)
  returning id into message_id;
  return message_id;
end;
$$;
revoke all on function public.react_mentor_send_post(text, text, text, text) from public, anon;
grant execute on function public.react_mentor_send_post(text, text, text, text) to authenticated;

commit;
