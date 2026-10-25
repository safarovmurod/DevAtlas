-- Separate from legacy user-editable progress. Apply after the account migrations.
begin;
create table public.react_mentor_assessment_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null,
  course_id text not null check (course_id ~ '^[a-z0-9][a-z0-9_-]{0,119}$'),
  lesson_id text not null check (lesson_id ~ '^[a-z0-9][a-z0-9_-]{0,119}$'),
  lesson_version integer not null check (lesson_version > 0),
  submission_sha256 text not null check (submission_sha256 ~ '^[a-f0-9]{64}$'),
  quiz_total integer not null check (quiz_total between 1 and 100),
  quiz_correct integer not null check (quiz_correct between 0 and quiz_total),
  critical_total integer not null check (critical_total between 1 and quiz_total),
  critical_correct integer not null check (critical_correct between 0 and critical_total and critical_correct <= quiz_correct),
  practice_passed boolean not null,
  mastered boolean generated always as (practice_passed and quiz_correct * 100 >= quiz_total * 80 and critical_correct = critical_total) stored,
  graded_at timestamptz not null default now(),
  primary key(user_id,attempt_id)
);
create index mentor_assessment_lesson_idx on public.react_mentor_assessment_attempts(user_id,course_id,lesson_id,graded_at desc);
alter table public.react_mentor_assessment_attempts enable row level security;
revoke all on public.react_mentor_assessment_attempts from public,anon,authenticated;
grant select on public.react_mentor_assessment_attempts to authenticated;
grant all on public.react_mentor_assessment_attempts to service_role;
create policy "assessment attempts are private" on public.react_mentor_assessment_attempts for select to authenticated
  using (user_id=(select auth.uid()) and (select public.react_mentor_session_allowed()));

create function public.react_mentor_record_assessment(
  learner_id uuid,attempt uuid,course text,lesson text,version integer,submission_hash text,
  total integer,correct integer,critical_total integer,critical_correct integer,practice_passed boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare old_hash text;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server authorization required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(learner_id::text||':'||attempt::text,2601));
  select submission_sha256 into old_hash from public.react_mentor_assessment_attempts where user_id=learner_id and attempt_id=attempt;
  if found then
    if old_hash is distinct from submission_hash then raise exception 'Assessment attempt ID already used' using errcode='PT409'; end if;
    return true;
  end if;
  insert into public.react_mentor_assessment_attempts(user_id,attempt_id,course_id,lesson_id,lesson_version,submission_sha256,quiz_total,quiz_correct,critical_total,critical_correct,practice_passed)
    values(learner_id,attempt,course,lesson,version,submission_hash,total,correct,critical_total,critical_correct,practice_passed);
  return true;
end;
$$;
revoke all on function public.react_mentor_record_assessment(uuid,uuid,text,text,integer,text,integer,integer,integer,integer,boolean) from public,anon,authenticated;
grant execute on function public.react_mentor_record_assessment(uuid,uuid,text,text,integer,text,integer,integer,integer,integer,boolean) to service_role;
commit;
