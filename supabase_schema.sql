-- Kaeluma LEGACY kiosk schema (run this in Supabase SQL Editor)
--
-- ⚠️  DO NOT use this file for a fresh project. It predates the multi-tenant
--     auth model: the tables below have NO user_id column, and the original
--     version granted "Allow anon full access" (using true) on every table —
--     i.e. a publicly readable/writable database.
--
--     For a FRESH project, run instead (in this order):
--       1. supabase_migration.sql          (adds user_id + per-user RLS)
--       2. supabase_security_migration.sql (read-only RLS + kaeluma_* RPCs)
--       3. create_support_tickets.sql      (optional: support tickets)
--
--     For an EXISTING project already on the kiosk schema, this file is now
--     neutralized: it drops the old open-access policies below. Do NOT re-add
--     them; the per-user policies from the migration files are the source of
--     truth.

create extension if not exists "uuid-ossp";

-- ============================================
-- APP SETTINGS (single row)
-- ============================================
create table if not exists app_settings (
  id uuid primary key default uuid_generate_v4(),
  parent_pin text,
  setup_complete boolean default false,
  require_approval boolean default true,
  family_name text default 'Our Family'
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
  streak integer default 0,
  last_completion_date text,
  theme text default 'seedling',
  unlocked_colors text[] default ARRAY['seedling'],
  ring_style text default 'solid',
  age_group text default 'all',
  created_at timestamp with time zone default timezone('utc'::text, now())
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
  max_completions integer default 1,
  frequency text default 'daily',  -- 'daily' | 'weekly' | 'monthly' | 'date_range'
  max_completions_per_period integer default 1,
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
-- ROW LEVEL SECURITY
-- ============================================
-- RLS is enabled on every table. The legacy kiosk build used
-- "Allow anon full access" (using true) policies here — those have been
-- removed and MUST NOT be re-created. With RLS enabled and no policies,
-- all access is denied until per-user policies exist, which come from:
--   supabase_migration.sql (or supabase_security_migration.sql).
alter table app_settings enable row level security;
alter table children enable row level security;
alter table missions enable row level security;
alter table completions enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;

-- Drop the old open-access policies if they were ever created (safe re-run)
drop policy if exists "Allow anon full access to app_settings" on app_settings;
drop policy if exists "Allow anon full access to children" on children;
drop policy if exists "Allow anon full access to missions" on missions;
drop policy if exists "Allow anon full access to completions" on completions;
drop policy if exists "Allow anon full access to rewards" on rewards;
drop policy if exists "Allow anon full access to redemptions" on redemptions;

-- ============================================
-- DEFAULT ROW (kiosk-era only)
-- ============================================
-- Unauthenticated shared settings row for the legacy kiosk flow.
-- The multi-tenant app creates one app_settings row per user instead
-- (see src/app/actions/auth.js). Harmless to keep for legacy installs.
insert into app_settings (setup_complete) values (false)
on conflict do nothing;
