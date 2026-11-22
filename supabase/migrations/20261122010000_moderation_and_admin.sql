-- Moderation & Admin extension:
-- 1) Profanity 5-strike / 3-day block across AI Tutor, Voice Instructor and Community Chat.
-- 2) Unified moderation status + 1-click admin moderation reset RPCs.
-- 3) Database-level enforcement of active profanity block in Community Chat RPCs
--    (owner/admin accounts bypass moderation blocks via verified auth.users metadata).
-- 4) Extended admin audit action check for moderation_reset and broadcast_notify.
-- Idempotent: safe to run more than once.
begin;

alter table public.react_mentor_tutor_strikes
  add column if not exists profanity_strikes integer not null default 0;
alter table public.react_mentor_tutor_strikes
  add column if not exists profanity_blocked_until timestamptz;
alter table public.react_mentor_tutor_strikes
  add column if not exists last_profanity_at timestamptz;

alter table public.react_mentor_tutor_strikes
  drop constraint if exists react_mentor_tutor_strikes_profanity_check;
alter table public.react_mentor_tutor_strikes
  add constraint react_mentor_tutor_strikes_profanity_check
  check (profanity_strikes between 0 and 5);

grant select, insert, update, delete on public.react_mentor_tutor_strikes to service_role;

-- Helper: true when the user has server-assigned admin or owner metadata.
create or replace function public.react_mentor_is_privileged(learner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from auth.users u
     where u.id = learner_id
       and (
         (u.raw_app_meta_data ->> 'app_owner') = 'true'
         or (u.raw_app_meta_data ->> 'app_role') = 'admin'
       )
  );
$$;
revoke all on function public.react_mentor_is_privileged(uuid) from public, anon, authenticated;

-- Unified moderation status for a learner (service_role only).
create or replace function public.react_mentor_get_moderation_status(learner_id uuid)
returns table(
  off_topic_strikes integer,
  off_topic_blocked boolean,
  off_topic_blocked_until timestamptz,
  profanity_strikes integer,
  profanity_blocked boolean,
  profanity_blocked_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data public.react_mentor_tutor_strikes%rowtype;
  now_ts timestamptz := clock_timestamp();
  ot_strikes integer := 0;
  ot_blocked boolean := false;
  ot_until timestamptz := null;
  pr_strikes integer := 0;
  pr_blocked boolean := false;
  pr_until timestamptz := null;
begin
  if auth.role() is distinct from 'service_role' then
    raise insufficient_privilege;
  end if;
  if learner_id is null then
    raise exception 'learner_id is required' using errcode = '22023';
  end if;

  if public.react_mentor_is_privileged(learner_id) then
    return query select 0, false, null::timestamptz, 0, false, null::timestamptz;
    return;
  end if;

  select * into row_data
    from public.react_mentor_tutor_strikes
   where user_id = learner_id;

  if not found then
    return query select 0, false, null::timestamptz, 0, false, null::timestamptz;
    return;
  end if;

  if row_data.blocked_until is not null then
    if row_data.blocked_until > now_ts then
      ot_strikes := 3;
      ot_blocked := true;
      ot_until := row_data.blocked_until;
    else
      ot_strikes := 0;
    end if;
  else
    ot_strikes := least(3, greatest(0, row_data.strikes));
  end if;

  if row_data.profanity_blocked_until is not null then
    if row_data.profanity_blocked_until > now_ts then
      pr_strikes := 5;
      pr_blocked := true;
      pr_until := row_data.profanity_blocked_until;
    else
      pr_strikes := 0;
    end if;
  else
    pr_strikes := least(5, greatest(0, row_data.profanity_strikes));
  end if;

  return query select ot_strikes, ot_blocked, ot_until, pr_strikes, pr_blocked, pr_until;
end;
$$;

-- Atomic 5-strike profanity tracker -> 3-day block across AI Tutor, Voice and Community Chat.
create or replace function public.react_mentor_record_profanity_strike(learner_id uuid)
returns table(strikes integer, blocked boolean, blocked_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.react_mentor_tutor_strikes%rowtype;
  now_ts timestamptz := clock_timestamp();
  next_strikes integer;
  next_blocked_until timestamptz;
begin
  if auth.role() is distinct from 'service_role' then
    raise insufficient_privilege;
  end if;
  if learner_id is null then
    raise exception 'learner_id is required' using errcode = '22023';
  end if;

  if public.react_mentor_is_privileged(learner_id) then
    return query select 0, false, null::timestamptz;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('profanity_strike:' || learner_id::text, 0));

  select * into existing
    from public.react_mentor_tutor_strikes
   where user_id = learner_id
   for update;

  if found and existing.profanity_blocked_until is not null and existing.profanity_blocked_until > now_ts then
    return query select 5, true, existing.profanity_blocked_until;
    return;
  end if;

  if not found or (existing.profanity_blocked_until is not null and existing.profanity_blocked_until <= now_ts) then
    next_strikes := 1;
    next_blocked_until := null;
  else
    next_strikes := least(5, existing.profanity_strikes + 1);
    if next_strikes >= 5 then
      next_blocked_until := now_ts + interval '3 days';
    else
      next_blocked_until := null;
    end if;
  end if;

  insert into public.react_mentor_tutor_strikes (
    user_id,
    strikes,
    blocked_until,
    profanity_strikes,
    profanity_blocked_until,
    last_profanity_at,
    updated_at
  ) values (
    learner_id,
    0,
    null,
    next_strikes,
    next_blocked_until,
    now_ts,
    now_ts
  )
  on conflict (user_id) do update set
    profanity_strikes = excluded.profanity_strikes,
    profanity_blocked_until = excluded.profanity_blocked_until,
    last_profanity_at = excluded.last_profanity_at,
    updated_at = excluded.updated_at;

  return query select next_strikes, (next_blocked_until is not null), next_blocked_until;
end;
$$;

-- Admin 1-click moderation reset (clears both off-topic and profanity strikes/blocks).
create or replace function public.react_mentor_reset_moderation(learner_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise insufficient_privilege;
  end if;
  if learner_id is null then
    raise exception 'learner_id is required' using errcode = '22023';
  end if;

  delete from public.react_mentor_tutor_strikes where user_id = learner_id;
end;
$$;

revoke all on function public.react_mentor_get_moderation_status(uuid) from public, anon, authenticated;
grant execute on function public.react_mentor_get_moderation_status(uuid) to service_role;

revoke all on function public.react_mentor_record_profanity_strike(uuid) from public, anon, authenticated;
grant execute on function public.react_mentor_record_profanity_strike(uuid) to service_role;

revoke all on function public.react_mentor_reset_moderation(uuid) from public, anon, authenticated;
grant execute on function public.react_mentor_reset_moderation(uuid) to service_role;

-- Enforce active profanity block inside Community Chat write RPCs (defense in depth).
create or replace function public.react_mentor_community_not_muted(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.react_mentor_is_privileged(uid)
    or not exists (
      select 1
        from public.react_mentor_tutor_strikes s
       where s.user_id = uid
         and s.profanity_blocked_until is not null
         and s.profanity_blocked_until > clock_timestamp()
    );
$$;
revoke all on function public.react_mentor_community_not_muted(uuid) from public, anon, authenticated;

create or replace function public.react_mentor_send_message(message_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); display text; message_id uuid;
begin
 if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if not public.react_mentor_community_not_muted(uid) then raise exception 'Moderation block active' using errcode='42501'; end if;
 if message_body is null or char_length(btrim(message_body)) not between 1 and 2000 then raise exception 'Invalid message' using errcode='22023'; end if;
 perform public.react_mentor_community_rate_check(uid);
 select display_name into display from public.react_mentor_profiles where user_id=uid;
 if display is null then raise exception 'Profile required' using errcode='42501'; end if;
 insert into public.react_mentor_chat_messages(author_id,author_name,body) values(uid,display,btrim(message_body)) returning id into message_id;
 return message_id;
end;
$$;

create or replace function public.react_mentor_send_post(
 post_kind text, post_body text, post_code_language text default null, post_attachment_path text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); display text; message_id uuid; object_mime text; object_size bigint; clean text:=coalesce(post_body,'');
begin
 if not public.react_mentor_community_member() then raise exception 'Membership required' using errcode='42501'; end if;
 if not public.react_mentor_community_not_muted(uid) then raise exception 'Moderation block active' using errcode='42501'; end if;
 if post_kind not in ('text','code','image','video') then raise exception 'Invalid kind' using errcode='22023'; end if;
 if post_kind in ('text','code') then clean:=btrim(clean); end if;
 if (post_kind='text' and char_length(clean) not between 1 and 2000)
 or (post_kind='code' and char_length(clean) not between 1 and 8000)
 or (post_kind in ('image','video') and char_length(clean)>2000)
 or (post_code_language is not null and (post_kind<>'code' or post_code_language !~ '^[a-z0-9+#-]{1,20}$')) then
  raise exception 'Invalid message' using errcode='22023';
 end if;
 if post_kind in ('image','video') then
  if post_attachment_path is null or post_attachment_path !~ ('^'||uid::text||'/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$') then
   raise exception 'Invalid attachment' using errcode='22023';
  end if;
  select o.metadata->>'mimetype',(o.metadata->>'size')::bigint into object_mime,object_size
  from storage.objects o where o.bucket_id='community-media' and o.name=post_attachment_path and o.owner_id=uid::text;
  if object_mime is null
  or (post_kind='image' and (object_mime not in ('image/jpeg','image/png','image/webp') or object_size>5242880))
  or (post_kind='video' and (object_mime not in ('video/mp4','video/webm') or object_size>26214400))
  or exists(select 1 from public.react_mentor_chat_messages where attachment_path=post_attachment_path) then
   raise exception 'Invalid attachment' using errcode='22023';
  end if;
 elsif post_attachment_path is not null then
  raise exception 'Invalid attachment' using errcode='22023';
 end if;
 perform public.react_mentor_community_rate_check(uid);
 select display_name into display from public.react_mentor_profiles where user_id=uid;
 if display is null then raise exception 'Profile required' using errcode='42501'; end if;
 insert into public.react_mentor_chat_messages(author_id,author_name,body,kind,code_language,attachment_path,attachment_mime)
 values(uid,display,clean,post_kind,post_code_language,post_attachment_path,object_mime)
 returning id into message_id;
 return message_id;
end;
$$;

revoke all on function public.react_mentor_send_message(text),
 public.react_mentor_send_post(text,text,text,text) from public, anon;
grant execute on function public.react_mentor_send_message(text),
 public.react_mentor_send_post(text,text,text,text) to authenticated;

-- Extend admin audit log allowed action types cleanly.
alter table public.react_mentor_admin_audit
  drop constraint if exists react_mentor_admin_audit_action_check;
alter table public.react_mentor_admin_audit
  add constraint react_mentor_admin_audit_action_check
  check (action in (
    'membership_grant', 'membership_extend', 'membership_revoke',
    'role_grant', 'role_revoke', 'ban', 'unban', 'notify', 'delete_user',
    'moderation_reset', 'broadcast_notify'
  ));

commit;
