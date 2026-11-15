-- Real payments with Dodo Payments (Merchant of Record). Apply after
-- 20261116000000_admin_tools.sql. Safe to run more than once. Nothing here grants paid
-- access by itself, no existing table, policy or function is dropped or replaced.
--
-- Trust model: the browser never writes a plan. Only the verified webhook route (service
-- role) calls react_mentor_apply_payment_event, which records the webhook id and changes
-- the membership in ONE transaction. If anything fails the id is not recorded, so the
-- provider's retry is processed again.
begin;

-- 1. Link between a membership row and the subscription at the provider.
alter table public.react_mentor_memberships
  add column if not exists provider text,
  add column if not exists provider_customer_id text,
  add column if not exists provider_subscription_id text,
  add column if not exists provider_status text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists provider_event_at timestamptz;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'react_mentor_memberships_provider_check'
      and conrelid = 'public.react_mentor_memberships'::regclass
  ) then
    alter table public.react_mentor_memberships
      add constraint react_mentor_memberships_provider_check
      check (provider is null or provider in ('dodo'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'react_mentor_memberships_provider_length_check'
      and conrelid = 'public.react_mentor_memberships'::regclass
  ) then
    alter table public.react_mentor_memberships
      add constraint react_mentor_memberships_provider_length_check
      check (
        char_length(coalesce(provider_customer_id, '')) <= 200
        and char_length(coalesce(provider_subscription_id, '')) <= 200
        and char_length(coalesce(provider_status, '')) <= 50
      );
  end if;
end;
$$;
-- One provider subscription belongs to at most one account.
create unique index if not exists react_mentor_memberships_provider_subscription_idx
  on public.react_mentor_memberships(provider, provider_subscription_id)
  where provider_subscription_id is not null;

-- 2. Webhook ids already processed (idempotency). RLS on, no policies: only the service
--    role touches it. Old rows can be deleted without harm after the provider's retry
--    window (about a day).
create table if not exists public.react_mentor_webhook_events (
  id text primary key check (char_length(id) between 1 and 200),
  provider text not null default 'dodo' check (provider in ('dodo')),
  type text not null check (char_length(type) between 1 and 100),
  received_at timestamptz not null default now()
);
create index if not exists react_mentor_webhook_events_received_idx
  on public.react_mentor_webhook_events(received_at);
alter table public.react_mentor_webhook_events enable row level security;
revoke all on public.react_mentor_webhook_events from public, anon, authenticated;
grant select, insert, delete on public.react_mentor_webhook_events to service_role;

-- 3. The only write path for payment events.
--    p_grant = true : the subscription is paid. The membership gets the tier and the end of
--                     the paid period (p_expires_at).
--    p_grant = false: no new paid time. Only the provider status / cancel flag change, and
--                     the end date can only move EARLIER (p_expires_at, when given).
--    Returns: applied | duplicate | stale | conflict | ignored.
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
      if existing.provider_subscription_id is not distinct from p_subscription_id then
        -- Same subscription: an older event never overwrites a newer one.
        if existing.provider_event_at is not null and p_event_at < existing.provider_event_at then
          return 'stale';
        end if;
      elsif existing.expires_at > now() then
        old_rank := case existing.tier when 'expert' then 2 when 'pro' then 1 else 0 end;
        new_rank := case p_tier when 'expert' then 2 else 1 end;
        -- A second paid subscription, or a payment for a lower plan than an admin gift, never
        -- replaces access that is still running. The money is not lost here: the webhook
        -- route logs it so the owner can refund it at the provider.
        if existing.provider_subscription_id is not null or old_rank > new_rank then
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
        when public.react_mentor_memberships.provider_subscription_id
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

commit;
