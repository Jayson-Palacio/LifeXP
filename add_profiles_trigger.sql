-- ============================================
-- TRIGGER: Auto-populate Profiles on Auth Signup
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create a function to handle new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Drop the trigger if it already exists
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Bind the function to a trigger on auth.users inserts
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
