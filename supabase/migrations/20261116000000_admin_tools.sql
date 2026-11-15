-- Admin tools: membership provenance, user notifications, admin audit log and a
-- database-level ban check. Apply after 20261115000000_chat_ultra_only.sql.
-- Safe to run more than once. No paid access is granted here and no existing
-- policy is dropped. Writes stay on the trusted server (service_role) only.
begin;

-- 1. Who granted a membership, when, and from which source. Rows created before this
--    migration keep granted_by/granted_at empty: their origin is not recorded anywhere,
--    so it is not invented here. Real payments do not exist yet; 'payment' is reserved
--    for a verified billing webhook.
alter table public.react_mentor_memberships
  add column if not exists source text not null default 'admin',
  add column if not exists granted_by uuid references auth.users(id) on delete set null,
  add column if not exists granted_at timestamptz;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'react_mentor_memberships_source_check'
      and conrelid = 'public.react_mentor_memberships'::regclass
  ) then
    alter table public.react_mentor_memberships
      add constraint react_mentor_memberships_source_check check (source in ('admin', 'payment'));
  end if;
end;
$$;
create index if not exists react_mentor_memberships_expires_idx
  on public.react_mentor_memberships(expires_at);

-- 2. A banned account loses database access as soon as the ban is set, even while its
--    last access token has not expired yet. Same function as in the accounts migration
--    plus the banned_until check; signature and grants are unchanged.
create or replace function public.react_mentor_session_allowed()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and not exists(
      select 1 from auth.users
      where id = auth.uid() and banned_until is not null and banned_until > now()
    )
    and (
      coalesce(auth.jwt()->>'aal','') = 'aal2'
      or not exists(select 1 from auth.mfa_factors where user_id = auth.uid() and status = 'verified')
    );
$$;
revoke all on function public.react_mentor_session_allowed() from public, anon;
grant execute on function public.react_mentor_session_allowed() to authenticated;

-- 3. Messages from an admin to one user. Users read and acknowledge only their own;
--    only the server (service_role) can create them. Text is plain, never HTML.
create table if not exists public.react_mentor_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists react_mentor_notifications_unread_idx
  on public.react_mentor_notifications(user_id, created_at)
  where read_at is null;
alter table public.react_mentor_notifications enable row level security;
revoke all on public.react_mentor_notifications from public, anon, authenticated;
-- The sender id is not exposed to the recipient.
grant select (id, user_id, body, created_at, read_at) on public.react_mentor_notifications to authenticated;
grant select, insert, update, delete on public.react_mentor_notifications to service_role;
drop policy if exists "own notifications read" on public.react_mentor_notifications;
create policy "own notifications read" on public.react_mentor_notifications
  for select to authenticated
  using (user_id = (select auth.uid()) and (select public.react_mentor_session_allowed()));

-- The only write a user can make: mark one of their own messages as read, at database time.
create or replace function public.react_mentor_mark_notification_read(notification_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.react_mentor_session_allowed() then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  update public.react_mentor_notifications
     set read_at = now()
   where id = notification_id and user_id = auth.uid() and read_at is null;
end;
$$;
revoke all on function public.react_mentor_mark_notification_read(uuid) from public, anon;
grant execute on function public.react_mentor_mark_notification_read(uuid) to authenticated;

-- 4. Append-only admin audit log. RLS is on with no policies, so only service_role reads
--    it; service_role may insert and read but not rewrite history. No foreign keys: an
--    entry must survive the deletion of the account it describes.
create table if not exists public.react_mentor_admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  actor_email text,
  action text not null check (action in (
    'membership_grant', 'membership_extend', 'membership_revoke',
    'role_grant', 'role_revoke', 'ban', 'unban', 'notify', 'delete_user'
  )),
  target_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);
create index if not exists react_mentor_admin_audit_created_idx
  on public.react_mentor_admin_audit(created_at desc);
alter table public.react_mentor_admin_audit enable row level security;
revoke all on public.react_mentor_admin_audit from public, anon, authenticated, service_role;
grant select, insert on public.react_mentor_admin_audit to service_role;

commit;
