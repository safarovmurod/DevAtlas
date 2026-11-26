-- Growth, Local Payment Requests, Referrals, Programs & Arena Leaderboard tables.
-- All paid membership upgrades remain strictly controlled by trusted billing/admin flows.

create table if not exists public.devatlas_local_payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  plan text not null check (plan in ('pro', 'ultra')),
  provider text not null check (provider in ('alif_mobi', 'korti_milli', 'dc_next', 'eskhata', 'other')),
  sender_name text not null,
  contact text not null,
  reference_code text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.devatlas_referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  visitor_hash text not null,
  landing_path text not null default '/',
  created_at timestamptz not null default now()
);

create table if not exists public.devatlas_program_applications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('bootcamp', 'classroom_b2b', 'employer_internship')),
  program_id text not null,
  full_name text not null,
  contact text not null,
  organization text,
  seats integer check (seats is null or (seats >= 1 and seats <= 5000)),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.devatlas_arena_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  track text not null,
  score integer not null check (score >= 0 and score <= 10000),
  correct_count integer not null check (correct_count >= 0 and correct_count <= 20),
  created_at timestamptz not null default now()
);

create table if not exists public.devatlas_telegram_users (
  chat_id bigint primary key,
  username text,
  first_name text,
  language_code text,
  referral_code text,
  reminders_enabled boolean not null default true,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.devatlas_local_payment_requests enable row level security;
alter table public.devatlas_referral_events enable row level security;
alter table public.devatlas_program_applications enable row level security;
alter table public.devatlas_arena_scores enable row level security;
alter table public.devatlas_telegram_users enable row level security;

revoke all on public.devatlas_local_payment_requests from anon, authenticated;
revoke all on public.devatlas_referral_events from anon, authenticated;
revoke all on public.devatlas_program_applications from anon, authenticated;
revoke all on public.devatlas_arena_scores from anon, authenticated;
revoke all on public.devatlas_telegram_users from anon, authenticated;

grant select on public.devatlas_local_payment_requests to authenticated;
grant select on public.devatlas_arena_scores to anon, authenticated;

drop policy if exists "local_pay_own_read" on public.devatlas_local_payment_requests;
create policy "local_pay_own_read"
  on public.devatlas_local_payment_requests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "arena_scores_public_read" on public.devatlas_arena_scores;
create policy "arena_scores_public_read"
  on public.devatlas_arena_scores
  for select
  to anon, authenticated
  using (true);
