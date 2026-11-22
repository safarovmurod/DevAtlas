-- Durable AI Tutor moderation strikes (3 warnings -> 3-day block across chat & voice).
-- Server-only enforcement via service_role RPCs; learners cannot read or alter strike rows directly.
-- Idempotent: safe to run more than once.
begin;

create table if not exists public.react_mentor_tutor_strikes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strikes integer not null default 0 check (strikes between 0 and 3),
  blocked_until timestamptz,
  last_violation_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.react_mentor_tutor_strikes enable row level security;
revoke all on public.react_mentor_tutor_strikes from public, anon, authenticated;
grant select on public.react_mentor_tutor_strikes to service_role;

create or replace function public.react_mentor_get_tutor_strike(learner_id uuid)
returns table(strikes integer, blocked boolean, blocked_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data public.react_mentor_tutor_strikes%rowtype;
  now_ts timestamptz := clock_timestamp();
begin
  if auth.role() is distinct from 'service_role' then
    raise insufficient_privilege;
  end if;
  if learner_id is null then
    raise exception 'learner_id is required' using errcode = '22023';
  end if;

  select * into row_data
    from public.react_mentor_tutor_strikes
   where user_id = learner_id;

  if not found then
    return query select 0, false, null::timestamptz;
    return;
  end if;

  if row_data.blocked_until is not null then
    if row_data.blocked_until > now_ts then
      return query select 3, true, row_data.blocked_until;
      return;
    end if;
    -- Previous 3-day block has expired: start fresh.
    return query select 0, false, null::timestamptz;
    return;
  end if;

  return query select least(3, greatest(0, row_data.strikes)), false, null::timestamptz;
end;
$$;

create or replace function public.react_mentor_record_tutor_strike(learner_id uuid)
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

  perform pg_advisory_xact_lock(hashtextextended('tutor_strike:' || learner_id::text, 0));

  select * into existing
    from public.react_mentor_tutor_strikes
   where user_id = learner_id
   for update;

  if found and existing.blocked_until is not null and existing.blocked_until > now_ts then
    return query select 3, true, existing.blocked_until;
    return;
  end if;

  if not found or (existing.blocked_until is not null and existing.blocked_until <= now_ts) then
    next_strikes := 1;
    next_blocked_until := null;
  else
    next_strikes := least(3, existing.strikes + 1);
    if next_strikes >= 3 then
      next_blocked_until := now_ts + interval '3 days';
    else
      next_blocked_until := null;
    end if;
  end if;

  insert into public.react_mentor_tutor_strikes (
    user_id, strikes, blocked_until, last_violation_at, updated_at
  ) values (
    learner_id, next_strikes, next_blocked_until, now_ts, now_ts
  )
  on conflict (user_id) do update set
    strikes = excluded.strikes,
    blocked_until = excluded.blocked_until,
    last_violation_at = excluded.last_violation_at,
    updated_at = excluded.updated_at;

  return query select next_strikes, (next_blocked_until is not null), next_blocked_until;
end;
$$;

revoke all on function public.react_mentor_get_tutor_strike(uuid) from public, anon, authenticated;
grant execute on function public.react_mentor_get_tutor_strike(uuid) to service_role;

revoke all on function public.react_mentor_record_tutor_strike(uuid) from public, anon, authenticated;
grant execute on function public.react_mentor_record_tutor_strike(uuid) to service_role;

commit;
