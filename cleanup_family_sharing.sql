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

-- 5. Drop the family access helper used in RLS policies
DROP FUNCTION IF EXISTS public.get_accessible_family_owner_ids();

-- Done! Your database is now clean of all family sharing artifacts.
