-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)
-- to create every table this backend expects.
--
-- Supabase's built-in `auth.users` table already handles email/password/login.
-- The tables below extend it with everything REWIRE-specific.

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
  created_at timestamp with time zone default now()
);

create table if not exists certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  score int not null,
  issue_date timestamp with time zone default now(),
  verification_url text
);

-- Row Level Security: users can only read/write their own rows.
-- (modules/scenarios are readable by anyone logged in - no RLS needed there for the MVP.)
alter table profiles enable row level security;
alter table assessments enable row level security;
alter table certificates enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can view own assessments" on assessments
  for select using (auth.uid() = user_id);
create policy "Users can insert own assessments" on assessments
  for insert with check (auth.uid() = user_id);

create policy "Users can view own certificates" on certificates
  for select using (auth.uid() = user_id);
