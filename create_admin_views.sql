-- ============================================
-- ADMIN VIEW: UNUSED ACCOUNTS
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create a secure view that only the Supabase Admin (you) can query.
-- It joins auth.users with public.profiles to show names and emails,
-- filtering out anyone who has actually used the app or is part of a family.

CREATE OR REPLACE VIEW public.admin_unused_accounts AS
SELECT 
  u.id AS user_id,
  u.email,
  p.first_name,
  p.last_name,
  u.created_at AS account_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE 
  -- 1. They are NOT a linked member of someone else's family
  NOT EXISTS (SELECT 1 FROM public.family_members fm WHERE fm.member_user_id = u.id)
  
  -- 2. They have NO children created under their account
  AND NOT EXISTS (SELECT 1 FROM public.children c WHERE c.user_id = u.id)
  
  -- 3. They have NO active missions created under their account
  AND NOT EXISTS (SELECT 1 FROM public.missions m WHERE m.user_id = u.id)
  
  -- 4. Exclude your main active admin account just in case! 
  -- (Assuming your main account has kids/missions, but just for extreme safety)
  AND u.email NOT LIKE '%+admin%'; 

-- Revoke access from regular users to ensure absolute security
REVOKE ALL ON public.admin_unused_accounts FROM anon;
REVOKE ALL ON public.admin_unused_accounts FROM authenticated;
