-- Improved Fix for Family Invites Read Access
-- Accepts text to prevent any client-side UUID casting issues
-- Explicitly grants execute permission to anonymous users

CREATE OR REPLACE FUNCTION get_invite_by_token(invite_token TEXT)
RETURNS TABLE (family_owner_id UUID, expires_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT f.family_owner_id, f.expires_at
  FROM public.family_invites f
  WHERE f.token::text = invite_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_invite_by_token(TEXT) TO anon, authenticated, public;
