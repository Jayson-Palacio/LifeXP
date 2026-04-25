-- ============================================
-- AUTO-LINK & PROFILE TRIGGER FOR NEW USERS
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user_invite()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create the user's profile from the raw_user_meta_data
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Check if the user's email has a pending invite
  IF EXISTS (SELECT 1 FROM public.family_invites WHERE invited_email = NEW.email) THEN
    
    -- 3. Insert into family_members for all matching invites
    INSERT INTO public.family_members (family_owner_id, member_user_id)
    SELECT family_owner_id, NEW.id
    FROM public.family_invites
    WHERE invited_email = NEW.email
    ON CONFLICT DO NOTHING;

    -- 4. Delete the consumed invites
    DELETE FROM public.family_invites
    WHERE invited_email = NEW.email;

    -- 5. Create app_settings with setup_complete
    INSERT INTO public.app_settings (user_id, setup_complete, family_name)
    VALUES (NEW.id, true, 'Our Family')
    ON CONFLICT (user_id) DO UPDATE SET setup_complete = true;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user_invite();
