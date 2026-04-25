-- ============================================
-- KAELUMA MULTI-TENANT SaaS MIGRATION
-- ============================================

-- WARNING: As requested, this drops all existing Kiosk data 
-- to start with a fresh slate for the SaaS architecture.

delete from redemptions;
delete from completions;
delete from rewards;
delete from missions;
delete from children;
delete from app_settings;

-- 1. Add user_id column tied to auth.users
alter table app_settings add column IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table children add column IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table missions add column IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table completions add column IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table rewards add column IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table redemptions add column IF NOT EXISTS user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 2. Drop the old open-access policies
drop policy if exists "Allow anon full access to app_settings" on app_settings;
drop policy if exists "Allow anon full access to children" on children;
drop policy if exists "Allow anon full access to missions" on missions;
drop policy if exists "Allow anon full access to completions" on completions;
drop policy if exists "Allow anon full access to rewards" on rewards;
drop policy if exists "Allow anon full access to redemptions" on redemptions;

-- 3. Create Multi-Tenant Secure RLS Policies
-- Only authenticated users can access the rows where `user_id` matches their own `auth.uid()`
create policy "Users can manage their own app_settings" on app_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own children" on children for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own missions" on missions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own completions" on completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own rewards" on rewards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own redemptions" on redemptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional: Since we require auth now, we don't need a default unauthenticated app_settings row.

-- ============================================
-- RING STYLE UNLOCK FEATURE (2026-04-18)
-- ============================================
alter table children add column IF NOT EXISTS ring_style text default 'solid';

-- ============================================
-- THEME MODE SETTING (2026-04-18)
-- ============================================
-- ============================================
-- DATABASE CLEANUP (2026-04-24)
-- ============================================

-- Remove unused children columns (level is calculated client-side)
ALTER TABLE children DROP COLUMN IF EXISTS level;
ALTER TABLE children DROP COLUMN IF EXISTS pending_level_up;
ALTER TABLE children DROP COLUMN IF EXISTS new_level_info;

-- Remove unused missions column
ALTER TABLE missions DROP COLUMN IF EXISTS is_recurring;

-- Remove unused app_settings column
ALTER TABLE app_settings DROP COLUMN IF EXISTS theme_mode;
