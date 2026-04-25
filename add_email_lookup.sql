CREATE OR REPLACE FUNCTION get_user_id_by_email(search_email TEXT)
RETURNS UUID AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id FROM auth.users WHERE email = search_email LIMIT 1;
  RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
