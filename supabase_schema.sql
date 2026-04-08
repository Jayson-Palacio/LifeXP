-- Execute this in the Supabase SQL Editor to set up your tables

-- Enable UUID extension (usually enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- App setup / settings (single row table)
create table app_settings (
  id uuid primary key default uuid_generate_v4(),
  parent_pin text,
  setup_complete boolean default false
);

create table children (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  avatar text not null,
  xp integer default 0,
  coins integer default 0,
  level integer default 1,
  streak integer default 0,
  last_completion_date text,
  pending_level_up boolean default false,
  new_level_info jsonb,
  theme text default 'indigo'
);

create table missions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  xp_reward integer default 10,
  coin_reward integer default 5,
  icon text,
  is_recurring boolean default true,
  max_completions integer default 1
);

create table completions (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  status text default 'pending', -- pending, approved, rejected
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  reviewed_at timestamp with time zone
);

create table rewards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cost integer not null,
  icon text
);

create table redemptions (
  id uuid primary key default uuid_generate_v4(),
  reward_id uuid references rewards(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  redeemed_at timestamp with time zone default timezone('utc'::text, now())
);

-- Turn on Row Level Security and allow anonymous access for prototyping
-- WARNING: In production, you would restrict these policies. For this local gamified app we allow anon access.
alter table app_settings enable row level security;
alter table children enable row level security;
alter table missions enable row level security;
alter table completions enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;

create policy "Allow anon full access to app_settings" on app_settings for all using (true) with check (true);
create policy "Allow anon full access to children" on children for all using (true) with check (true);
create policy "Allow anon full access to missions" on missions for all using (true) with check (true);
create policy "Allow anon full access to completions" on completions for all using (true) with check (true);
create policy "Allow anon full access to rewards" on rewards for all using (true) with check (true);
create policy "Allow anon full access to redemptions" on redemptions for all using (true) with check (true);

-- Insert a default app_settings row if it doesn't exist
insert into app_settings (setup_complete) values (false);
