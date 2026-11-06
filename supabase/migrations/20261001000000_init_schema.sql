-- ==============================================================================
-- REACT MENTOR FULL-STACK DATABASE SCHEMA & ROW LEVEL SECURITY
-- Multi-device workspace synchronization with isolated training tables
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. WORKSPACES
create table if not exists public.workspaces (
    id uuid primary key default uuid_generate_v4(),
    name text not null default 'My Workspace',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. WORKSPACE MEMBERS (Membership mapping auth.uid() to workspace)
create table if not exists public.workspace_members (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    role text not null check (role in ('owner', 'member')),
    joined_at timestamptz not null default now(),
    unique(workspace_id, user_id)
);
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_workspace_members_workspace on public.workspace_members(workspace_id);

-- 3. DEVICES
create table if not exists public.devices (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    device_fingerprint text not null,
    name text not null,
    platform text not null default 'web',
    last_seen timestamptz not null default now(),
    created_at timestamptz not null default now(),
    unique(workspace_id, device_fingerprint)
);
create index if not exists idx_devices_workspace on public.devices(workspace_id);

-- 4. PAIR CODES (Hashed one-time pairing codes for multi-device connect)
create table if not exists public.pair_codes (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    code_hash text not null,
    expires_at timestamptz not null,
    used_at timestamptz,
    attempt_count int not null default 0,
    created_by uuid not null,
    created_at timestamptz not null default now()
);
create index if not exists idx_pair_codes_hash on public.pair_codes(code_hash);
create index if not exists idx_pair_codes_workspace on public.pair_codes(workspace_id);

-- 5. PROFILES
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null unique,
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    display_name text not null default 'Learner',
    daily_time_minutes int not null default 60,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_workspace on public.profiles(workspace_id);

-- 6. USER SETTINGS
create table if not exists public.user_settings (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null unique,
    data_mode text not null default 'local' check (data_mode in ('local', 'global')),
    strict_interview boolean not null default false,
    strict_practice boolean not null default false,
    code_style_mode text not null default 'standard' check (code_style_mode in ('standard', 'my_style')),
    default_manager text not null default 'react_local' check (default_manager in ('react_local', 'zustand', 'redux_toolkit', 'jotai')),
    theme text not null default 'dark',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_user_settings_workspace on public.user_settings(workspace_id);

-- 7. LAST SESSIONS (Resume functionality)
create table if not exists public.last_sessions (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null unique,
    last_route text not null default '/home',
    last_topic_id text,
    last_lesson_id text,
    last_task_id text,
    last_manager text not null default 'react_local',
    last_level int not null default 1,
    last_mode text not null default 'local',
    state_json jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);
create index if not exists idx_last_sessions_workspace on public.last_sessions(workspace_id);

-- 8. STUDY SOURCES & TOPICS
create table if not exists public.study_sources (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    content_hash text not null,
    title text not null,
    file_type text not null,
    source_text text not null,
    is_active boolean not null default false,
    created_at timestamptz not null default now()
);
create index if not exists idx_study_sources_workspace on public.study_sources(workspace_id);
create index if not exists idx_study_sources_hash on public.study_sources(content_hash);

-- 9. CURRICULUM TOPICS & LESSONS (Global reference / syncable)
create table if not exists public.topics (
    id text primary key,
    title text not null,
    category text not null,
    stage int not null,
    description text not null,
    weight numeric not null default 1.0,
    created_at timestamptz not null default now()
);

create table if not exists public.lessons (
    id text primary key,
    topic_id text not null references public.topics(id) on delete cascade,
    title text not null,
    content_json jsonb not null,
    order_num int not null default 0,
    created_at timestamptz not null default now()
);
create index if not exists idx_lessons_topic on public.lessons(topic_id);

-- 10. QUESTIONS & QUESTION ATTEMPTS (Quizzes and Tests)
create table if not exists public.questions (
    id text primary key,
    topic_id text not null references public.topics(id) on delete cascade,
    type text not null,
    prompt text not null,
    options_json jsonb not null default '[]'::jsonb,
    answer text not null,
    rubric_json jsonb not null default '{}'::jsonb,
    explanation text not null,
    created_at timestamptz not null default now()
);
create index if not exists idx_questions_topic on public.questions(topic_id);

create table if not exists public.question_attempts (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    question_id text not null references public.questions(id) on delete cascade,
    topic_id text not null references public.topics(id) on delete cascade,
    user_answer text not null,
    is_correct boolean not null,
    score numeric not null default 0,
    rubric_feedback text,
    created_at timestamptz not null default now()
);
create index if not exists idx_question_attempts_workspace on public.question_attempts(workspace_id);
create index if not exists idx_question_attempts_topic on public.question_attempts(topic_id);

-- 11. PRACTICE TASKS & ATTEMPTS
create table if not exists public.practice_tasks (
    id text primary key,
    topic_id text not null references public.topics(id) on delete cascade,
    operation text not null,
    state_manager text not null,
    level int not null check (level between 1 and 4),
    prompt text not null,
    starter_code text not null,
    solution_code text not null,
    test_cases_json jsonb not null default '[]'::jsonb,
    hints_json jsonb not null default '[]'::jsonb,
    recommended_time_minutes int not null default 15,
    created_at timestamptz not null default now()
);
create index if not exists idx_practice_tasks_topic on public.practice_tasks(topic_id);
create index if not exists idx_practice_tasks_mgr_lvl on public.practice_tasks(state_manager, level);

create table if not exists public.practice_attempts (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    task_id text not null references public.practice_tasks(id) on delete cascade,
    topic_id text not null references public.topics(id) on delete cascade,
    state_manager text not null,
    level int not null,
    submitted_code text not null,
    passed boolean not null,
    score numeric not null default 0,
    diagnostics_json jsonb not null default '[]'::jsonb,
    duration_seconds int not null default 0,
    idempotency_key text unique,
    created_at timestamptz not null default now()
);
create index if not exists idx_practice_attempts_workspace on public.practice_attempts(workspace_id);
create index if not exists idx_practice_attempts_topic on public.practice_attempts(topic_id);

-- 12. INTERVIEW QUESTIONS & ATTEMPTS
create table if not exists public.interview_questions (
    id text primary key,
    topic_id text not null references public.topics(id) on delete cascade,
    prompt text not null,
    rubric_json jsonb not null default '{}'::jsonb,
    sample_good_answer text not null,
    sample_poor_answer text not null,
    category text not null default 'react',
    created_at timestamptz not null default now()
);

create table if not exists public.interview_attempts (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    question_id text not null references public.interview_questions(id) on delete cascade,
    topic_id text not null references public.topics(id) on delete cascade,
    user_transcript text not null,
    score numeric not null default 0,
    verdict text not null check (verdict in ('correct', 'partially_correct', 'incorrect')),
    feedback text not null,
    missing_concepts_json jsonb not null default '[]'::jsonb,
    duration_seconds int not null default 0,
    created_at timestamptz not null default now()
);
create index if not exists idx_interview_attempts_workspace on public.interview_attempts(workspace_id);
create index if not exists idx_interview_attempts_topic on public.interview_attempts(topic_id);

-- 13. SPACED REPETITION REVISION ITEMS
create table if not exists public.revision_items (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    item_type text not null,
    ref_id text not null,
    topic_id text not null references public.topics(id) on delete cascade,
    interval_days int not null default 1,
    repetitions int not null default 0,
    next_review_at timestamptz not null default now(),
    last_reviewed_at timestamptz,
    unique(workspace_id, item_type, ref_id)
);
create index if not exists idx_revision_items_workspace on public.revision_items(workspace_id);
create index if not exists idx_revision_items_next_review on public.revision_items(next_review_at);

-- 14. NOTES
create table if not exists public.notes (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    topic_id text,
    title text not null,
    content text not null,
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);
create index if not exists idx_notes_workspace on public.notes(workspace_id);

-- 15. STUDY EVENTS (Immutable event ledger for verifiable progress)
create table if not exists public.study_events (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    device_id uuid references public.devices(id) on delete set null,
    source_id uuid references public.study_sources(id) on delete set null,
    topic_id text references public.topics(id) on delete set null,
    lesson_id text,
    task_id text,
    event_type text not null,
    score numeric,
    correct boolean,
    duration_seconds int not null default 0,
    idempotency_key text unique,
    created_at timestamptz not null default now()
);
create index if not exists idx_study_events_workspace on public.study_events(workspace_id);
create index if not exists idx_study_events_topic on public.study_events(topic_id);
create index if not exists idx_study_events_created_at on public.study_events(created_at);

-- 16. STUDY SESSIONS (Active heartbeat-based time tracking)
create table if not exists public.study_sessions (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    device_id uuid references public.devices(id) on delete set null,
    active_seconds int not null default 0,
    date_key text not null, -- YYYY-MM-DD
    last_heartbeat timestamptz not null default now(),
    created_at timestamptz not null default now(),
    unique(workspace_id, user_id, date_key)
);
create index if not exists idx_study_sessions_workspace on public.study_sessions(workspace_id);

-- 17. CODING PROFILES (Extracted from project analysis)
create table if not exists public.coding_profiles (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    api_client text not null default 'axios',
    async_style text not null default 'async_await',
    naming_style text not null default 'camelCase',
    state_managers_json jsonb not null default '[]'::jsonb,
    error_handling text not null default 'try_catch',
    patterns_json jsonb not null default '{}'::jsonb,
    confidence text not null default 'Low' check (confidence in ('Low', 'Medium', 'High')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_coding_profiles_workspace on public.coding_profiles(workspace_id);

-- 18. CHAT SESSIONS & MESSAGES (Tutor discussions)
create table if not exists public.chat_sessions (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null,
    title text not null default 'Сӯҳбат бо ментор',
    created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid not null references public.chat_sessions(id) on delete cascade,
    sender text not null check (sender in ('user', 'assistant')),
    content text not null,
    created_at timestamptz not null default now()
);
create index if not exists idx_chat_messages_session on public.chat_messages(session_id);

-- 19. TRAINING TODOS (Dedicated sandboxed database for Global Practice API)
create table if not exists public.training_todos (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    title text not null,
    completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_training_todos_workspace on public.training_todos(workspace_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each authenticated user only accesses data from their own workspace memberships
-- ==============================================================================

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.devices enable row level security;
alter table public.pair_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.last_sessions enable row level security;
alter table public.study_sources enable row level security;
alter table public.question_attempts enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.interview_attempts enable row level security;
alter table public.revision_items enable row level security;
alter table public.notes enable row level security;
alter table public.study_events enable row level security;
alter table public.study_sessions enable row level security;
alter table public.coding_profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.training_todos enable row level security;

-- Curriculum tables are readable by anyone
alter table public.topics enable row level security;
create policy "Topics are readable by everyone" on public.topics for select using (true);

alter table public.lessons enable row level security;
create policy "Lessons are readable by everyone" on public.lessons for select using (true);

alter table public.questions enable row level security;
create policy "Questions are readable by everyone" on public.questions for select using (true);

alter table public.practice_tasks enable row level security;
create policy "Practice tasks are readable by everyone" on public.practice_tasks for select using (true);

alter table public.interview_questions enable row level security;
create policy "Interview questions are readable by everyone" on public.interview_questions for select using (true);

-- Workspace Membership Helper Function
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean as $$
begin
    return exists (
        select 1 from public.workspace_members
        where workspace_id = ws_id
        and user_id = auth.uid()
    );
end;
$$ language plpgsql security definer;

-- Workspace Member Policies
create policy "Workspaces access by members" on public.workspaces
    for all using (public.is_workspace_member(id));

create policy "Workspace members access by members" on public.workspace_members
    for all using (public.is_workspace_member(workspace_id));

create policy "Devices access by members" on public.devices
    for all using (public.is_workspace_member(workspace_id));

create policy "Pair codes access by members" on public.pair_codes
    for all using (public.is_workspace_member(workspace_id));

create policy "Profiles access by members" on public.profiles
    for all using (public.is_workspace_member(workspace_id));

create policy "User settings access by members" on public.user_settings
    for all using (public.is_workspace_member(workspace_id));

create policy "Last sessions access by members" on public.last_sessions
    for all using (public.is_workspace_member(workspace_id));

create policy "Study sources access by members" on public.study_sources
    for all using (public.is_workspace_member(workspace_id));

create policy "Question attempts access by members" on public.question_attempts
    for all using (public.is_workspace_member(workspace_id));

create policy "Practice attempts access by members" on public.practice_attempts
    for all using (public.is_workspace_member(workspace_id));

create policy "Interview attempts access by members" on public.interview_attempts
    for all using (public.is_workspace_member(workspace_id));

create policy "Revision items access by members" on public.revision_items
    for all using (public.is_workspace_member(workspace_id));

create policy "Notes access by members" on public.notes
    for all using (public.is_workspace_member(workspace_id));

create policy "Study events access by members" on public.study_events
    for all using (public.is_workspace_member(workspace_id));

create policy "Study sessions access by members" on public.study_sessions
    for all using (public.is_workspace_member(workspace_id));

create policy "Coding profiles access by members" on public.coding_profiles
    for all using (public.is_workspace_member(workspace_id));

create policy "Chat sessions access by members" on public.chat_sessions
    for all using (public.is_workspace_member(workspace_id));

create policy "Chat messages access by session membership" on public.chat_messages
    for all using (
        exists (
            select 1 from public.chat_sessions cs
            where cs.id = session_id
            and public.is_workspace_member(cs.workspace_id)
        )
    );

create policy "Training todos access by members" on public.training_todos
    for all using (public.is_workspace_member(workspace_id));
