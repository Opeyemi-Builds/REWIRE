-- REWIRE database schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- Supabase's built-in `auth.users` table already handles email/password/login.
-- The tables below extend it with everything REWIRE-specific.
--
-- This script is idempotent where practical (IF NOT EXISTS / drop-before-create
-- on policies) so it can be re-run safely during development.

-- =====================================================================
-- Tables
-- =====================================================================

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  level text default 'Beginner',
  total_score int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists modules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  order_index int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists scenarios (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  context text not null,
  options jsonb not null,        -- e.g. [{ "id": "A", "text": "Click immediately" }, ...]
  correct_answer text not null,  -- e.g. "C"
  explanation text,
  difficulty text default 'easy',
  created_at timestamp with time zone default now()
);

create table if not exists assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  scenario_id uuid references scenarios(id) on delete cascade,
  selected_answer text not null,
  correct boolean not null,
  score int not null,
  created_at timestamp with time zone default now(),
  -- One attempt per scenario per user. Enforced at the DB level as defense in
  -- depth behind the application check in services/scoringService.js.
  unique (user_id, scenario_id)
);

create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  score int not null,
  issue_date timestamp with time zone default now(),
  verification_url text
);

-- =====================================================================
-- Indexes (speed up the common "find my rows" lookups)
-- =====================================================================

create index if not exists idx_scenarios_module_id on scenarios(module_id);
create index if not exists idx_assessments_user_id on assessments(user_id);
create index if not exists idx_certificates_user_id on certificates(user_id);

-- =====================================================================
-- Auto-create a profile row when a new auth user signs up
-- =====================================================================
-- The backend also inserts a profile on signup (via the admin client), and that
-- insert tolerates a duplicate (23505). This trigger is a safety net so a
-- profile always exists even if a user is created through the Supabase dashboard
-- or another client. `security definer` lets it bypass RLS.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================
-- Users can only read/write their own rows. modules/scenarios are readable by
-- any logged-in user. Trusted server-side writes (grading, issuing certificates,
-- creating the profile on signup) go through the service-role key, which
-- bypasses RLS - so those paths don't strictly need INSERT policies, but the
-- policies below are included so the tables are also usable directly from an
-- authenticated client if needed later.

alter table profiles enable row level security;
alter table scenarios enable row level security;
alter table modules enable row level security;
alter table assessments enable row level security;
alter table certificates enable row level security;

-- ---- profiles ----
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- ---- modules (read-only for any logged-in user) ----
drop policy if exists "Logged-in users can view modules" on modules;
create policy "Logged-in users can view modules" on modules
  for select using (auth.role() = 'authenticated');

-- ---- scenarios (read-only for any logged-in user) ----
drop policy if exists "Logged-in users can view scenarios" on scenarios;
create policy "Logged-in users can view scenarios" on scenarios
  for select using (auth.role() = 'authenticated');

-- ---- assessments ----
drop policy if exists "Users can view own assessments" on assessments;
create policy "Users can view own assessments" on assessments
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own assessments" on assessments;
create policy "Users can insert own assessments" on assessments
  for insert with check (auth.uid() = user_id);

-- ---- certificates ----
drop policy if exists "Users can view own certificates" on certificates;
create policy "Users can view own certificates" on certificates
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own certificates" on certificates;
create policy "Users can insert own certificates" on certificates
  for insert with check (auth.uid() = user_id);
