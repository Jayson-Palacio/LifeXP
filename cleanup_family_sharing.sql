-- ============================================
-- CLEANUP: Remove Family Sharing Infrastructure
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Drop the auto-link trigger
DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_invite();

-- 2. Drop the admin view
DROP VIEW IF EXISTS public.admin_unused_accounts;

-- 3. Drop the family sharing tables
DROP TABLE IF EXISTS public.family_invites;
DROP TABLE IF EXISTS public.family_members;

-- 4. Drop the helper function used for email lookups
DROP FUNCTION IF EXISTS public.get_user_id_by_email(text);

-- 5. Drop RLS policies that depend on get_accessible_family_owner_ids()
DROP POLICY IF EXISTS "Shared members can select app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Shared members can select children" ON public.children;
DROP POLICY IF EXISTS "Shared members can update children" ON public.children;
DROP POLICY IF EXISTS "Shared members can manage missions" ON public.missions;
DROP POLICY IF EXISTS "Shared members can manage rewards" ON public.rewards;
DROP POLICY IF EXISTS "Shared members can manage completions" ON public.completions;
DROP POLICY IF EXISTS "Shared members can manage redemptions" ON public.redemptions;

-- 6. Now safely drop the function
DROP FUNCTION IF EXISTS public.get_accessible_family_owner_ids();

-- Done! Your database is now clean of all family sharing artifacts.
