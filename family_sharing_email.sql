-- ============================================
-- FAMILY SHARING: Email-Based Invites
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times
-- ============================================

-- 1. Drop the old token-based invites table and recreate with email
DROP TABLE IF EXISTS public.family_invites;

CREATE TABLE public.family_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_owner_id, invited_email)
);

ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own invites
CREATE POLICY "Owners can manage their invites"
  ON public.family_invites FOR ALL
  USING (auth.uid() = family_owner_id);

-- Anyone can read invites (needed during signup to check email)
CREATE POLICY "Anyone can read invites"
  ON public.family_invites FOR SELECT
  USING (true);

-- 2. Ensure family_members table exists (safe if already created)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'co-parent',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_owner_id, member_user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of their family" ON public.family_members;
CREATE POLICY "Users can view members of their family"
  ON public.family_members FOR SELECT
  USING (auth.uid() = family_owner_id OR auth.uid() = member_user_id);

DROP POLICY IF EXISTS "Family owners can manage members" ON public.family_members;
CREATE POLICY "Family owners can manage members"
  ON public.family_members FOR ALL
  USING (auth.uid() = family_owner_id);

-- Allow new members to insert themselves (needed during signup auto-link)
DROP POLICY IF EXISTS "New members can insert themselves" ON public.family_members;
CREATE POLICY "New members can insert themselves"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = member_user_id);

-- 3. Ensure the sharing helper function exists
CREATE OR REPLACE FUNCTION get_accessible_family_owner_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT auth.uid()
  UNION
  SELECT family_owner_id FROM public.family_members WHERE member_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate all sharing policies on existing tables
DROP POLICY IF EXISTS "Shared members can select app_settings" ON public.app_settings;
CREATE POLICY "Shared members can select app_settings"
  ON public.app_settings FOR SELECT
  USING (user_id IN (SELECT get_accessible_family_owner_ids()));

DROP POLICY IF EXISTS "Shared members can select children" ON public.children;
CREATE POLICY "Shared members can select children"
  ON public.children FOR SELECT
  USING (user_id IN (SELECT get_accessible_family_owner_ids()));

DROP POLICY IF EXISTS "Shared members can update children" ON public.children;
CREATE POLICY "Shared members can update children"
  ON public.children FOR UPDATE
  USING (user_id IN (SELECT get_accessible_family_owner_ids()));

DROP POLICY IF EXISTS "Shared members can manage missions" ON public.missions;
CREATE POLICY "Shared members can manage missions"
  ON public.missions FOR ALL
  USING (user_id IN (SELECT get_accessible_family_owner_ids()));

DROP POLICY IF EXISTS "Shared members can manage rewards" ON public.rewards;
CREATE POLICY "Shared members can manage rewards"
  ON public.rewards FOR ALL
  USING (user_id IN (SELECT get_accessible_family_owner_ids()));

DROP POLICY IF EXISTS "Shared members can manage completions" ON public.completions;
CREATE POLICY "Shared members can manage completions"
  ON public.completions FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id IN (SELECT get_accessible_family_owner_ids())));

DROP POLICY IF EXISTS "Shared members can manage redemptions" ON public.redemptions;
CREATE POLICY "Shared members can manage redemptions"
  ON public.redemptions FOR ALL
  USING (child_id IN (SELECT id FROM public.children WHERE user_id IN (SELECT get_accessible_family_owner_ids())));
