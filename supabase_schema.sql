-- LifeXP Complete Schema (run this in Supabase SQL Editor)
-- Safe to run on a fresh project

create extension if not exists "uuid-ossp";

-- ============================================
-- APP SETTINGS (single row)
-- ============================================
create table if not exists app_settings (
  id uuid primary key default uuid_generate_v4(),
  parent_pin text,
  setup_complete boolean default false,
  require_approval boolean default true,
  family_name text default 'Our Family',
  theme_mode text default 'dark'
);

-- ============================================
-- CHILDREN
-- ============================================
create table if not exists children (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  avatar text not null,
  xp integer default 0,
  total_xp_earned integer default 0,
  coins integer default 0,
  level integer default 1,
  streak integer default 0,
  last_completion_date text,
  pending_level_up boolean default false,
  new_level_info jsonb,
  theme text default 'seedling',
  unlocked_colors text[] default ARRAY['seedling'],
  ring_style text default 'solid'
);

-- ============================================
-- MISSIONS
-- ============================================
create table if not exists missions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  xp_reward integer default 10,
  coin_reward integer default 5,
  icon text,
  is_recurring boolean default true,
  max_completions integer default 1,
  frequency text default 'daily',  -- 'daily' | 'weekly' | 'monthly' | 'date_range'
  specific_days integer[], -- [0=Sun, 1=Mon, ...] for weekly missions
  start_date date,
  end_date date,
  assigned_to uuid[] -- null means all children
);

-- ============================================
-- COMPLETIONS
-- ============================================
create table if not exists completions (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references missions(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  status text default 'pending', -- pending, approved, rejected
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  reviewed_at timestamp with time zone
);

-- ============================================
-- REWARDS
-- ============================================
create table if not exists rewards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  cost integer not null,
  icon text,
  image text,
  assigned_to uuid[],
  max_total_redemptions integer,
  max_daily_redemptions integer,
  max_weekly_redemptions integer,
  max_monthly_redemptions integer,
  is_active boolean default true
);

-- ============================================
-- REDEMPTIONS
-- ============================================
create table if not exists redemptions (
  id uuid primary key default uuid_generate_v4(),
  reward_id uuid references rewards(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  status text default 'pending', -- pending, fulfilled, refunded
  redeemed_at timestamp with time zone default timezone('utc'::text, now())
);

-- ============================================
-- ROW LEVEL SECURITY (anon access for kiosk)
-- ============================================
alter table app_settings enable row level security;
alter table children enable row level security;
alter table missions enable row level security;
alter table completions enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;

-- Drop policies if they already exist (safe re-run)
drop policy if exists "Allow anon full access to app_settings" on app_settings;
drop policy if exists "Allow anon full access to children" on children;
drop policy if exists "Allow anon full access to missions" on missions;
drop policy if exists "Allow anon full access to completions" on completions;
drop policy if exists "Allow anon full access to rewards" on rewards;
drop policy if exists "Allow anon full access to redemptions" on redemptions;

create policy "Allow anon full access to app_settings" on app_settings for all using (true) with check (true);
create policy "Allow anon full access to children" on children for all using (true) with check (true);
create policy "Allow anon full access to missions" on missions for all using (true) with check (true);
create policy "Allow anon full access to completions" on completions for all using (true) with check (true);
create policy "Allow anon full access to rewards" on rewards for all using (true) with check (true);
create policy "Allow anon full access to redemptions" on redemptions for all using (true) with check (true);

-- ============================================
-- DEFAULT ROW (required for setup check)
-- ============================================
insert into app_settings (setup_complete) values (false)
on conflict do nothing;
