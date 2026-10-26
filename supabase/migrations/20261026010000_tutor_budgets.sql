-- Conservative pre-dispatch reservations. No refund on provider/network failure:
-- a timeout does not prove that no billable work occurred. UTC daily windows.
begin;
create table public.react_mentor_ai_daily_budget (
 day date primary key,
 reserved_microusd bigint not null default 0 check(reserved_microusd>=0)
);
create table public.react_mentor_ai_user_budget (
 day date not null,
 user_id uuid not null references auth.users(id) on delete cascade,
 reserved_microusd bigint not null default 0 check(reserved_microusd>=0),
 requests integer not null default 0 check(requests>=0),
 last_requested_at timestamptz not null default '-infinity',
 primary key(day,user_id)
);
alter table public.react_mentor_ai_daily_budget enable row level security;
alter table public.react_mentor_ai_user_budget enable row level security;
revoke all on public.react_mentor_ai_daily_budget,public.react_mentor_ai_user_budget from public,anon,authenticated;
grant select on public.react_mentor_ai_daily_budget,public.react_mentor_ai_user_budget to service_role;

create function public.react_mentor_reserve_ai_budget(
 learner_id uuid,reservation_microusd bigint,global_limit_microusd bigint,user_limit_microusd bigint,user_request_limit integer
) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare today date := timezone('UTC',clock_timestamp())::date;
 total bigint; personal public.react_mentor_ai_user_budget%rowtype;
begin
 if auth.role() is distinct from 'service_role' then raise insufficient_privilege; end if;
 if learner_id is null or coalesce(reservation_microusd,0)<=0 or coalesce(global_limit_microusd,0)<=0 or coalesce(user_limit_microusd,0)<=0 or coalesce(user_request_limit,0)<=0
    or global_limit_microusd>1000000000000 or user_limit_microusd>1000000000000 or user_request_limit>10000 then
   raise exception 'Invalid AI budget' using errcode='22023';
 end if;
 -- One lock covers the global and per-account checks and both writes across
 -- all application instances. A denied reservation rolls back every write.
 perform pg_advisory_xact_lock(746201,2601);
 insert into public.react_mentor_ai_daily_budget(day) values(today) on conflict do nothing;
 insert into public.react_mentor_ai_user_budget(day,user_id) values(today,learner_id) on conflict do nothing;
 select reserved_microusd into total from public.react_mentor_ai_daily_budget where day=today;
 select * into personal from public.react_mentor_ai_user_budget where day=today and user_id=learner_id;
 if reservation_microusd>global_limit_microusd-total or reservation_microusd>user_limit_microusd-personal.reserved_microusd
    or personal.requests>=user_request_limit or personal.last_requested_at>clock_timestamp()-interval '3 seconds' then
   raise exception 'AI budget or rate limit reached' using errcode='PT429';
 end if;
 update public.react_mentor_ai_daily_budget set reserved_microusd=reserved_microusd+reservation_microusd where day=today;
 update public.react_mentor_ai_user_budget set reserved_microusd=reserved_microusd+reservation_microusd,requests=requests+1,last_requested_at=clock_timestamp() where day=today and user_id=learner_id;
end $$;
revoke all on function public.react_mentor_reserve_ai_budget(uuid,bigint,bigint,bigint,integer) from public,anon,authenticated;
grant execute on function public.react_mentor_reserve_ai_budget(uuid,bigint,bigint,bigint,integer) to service_role;
commit;
