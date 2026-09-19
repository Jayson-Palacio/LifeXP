-- Kaeluma Vital — nutrition & fitness tables
-- Run this in the Supabase SQL editor after the core family schema.

create table if not exists public.vital_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  sex text not null check (sex in ('male', 'female')),
  birth_year integer not null check (birth_year between 1920 and 2013),
  height_cm numeric(5,1) not null check (height_cm between 80 and 250),
  activity_level text not null default 'moderate'
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  units text not null default 'us' check (units in ('us', 'metric')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vital_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  start_weight_kg numeric(5,1) not null check (start_weight_kg between 20 and 400),
  current_weight_kg numeric(5,1) not null check (current_weight_kg between 20 and 400),
  target_weight_kg numeric(5,1) not null check (target_weight_kg between 20 and 400),
  weekly_loss_kg numeric(4,2) not null default 0.45 check (weekly_loss_kg between 0 and 1.2),
  calorie_target integer not null check (calorie_target between 1000 and 6000),
  protein_target_g integer not null check (protein_target_g between 40 and 400),
  carbs_target_g integer not null check (carbs_target_g between 0 and 800),
  fat_target_g integer not null check (fat_target_g between 20 and 250),
  updated_at timestamptz not null default now()
);

create table if not exists public.vital_weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  weight_kg numeric(5,1) not null check (weight_kg between 20 and 400),
  created_at timestamptz not null default now(),
  unique (user_id, logged_on)
);

create table if not exists public.vital_food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  meal text not null default 'snack' check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null check (char_length(name) between 1 and 120),
  calories integer not null check (calories between 0 and 5000),
  protein_g numeric(6,1) not null default 0 check (protein_g between 0 and 400),
  carbs_g numeric(6,1) not null default 0 check (carbs_g between 0 and 800),
  fat_g numeric(6,1) not null default 0 check (fat_g between 0 and 250),
  created_at timestamptz not null default now()
);

create index if not exists vital_weigh_ins_user_day_idx on public.vital_weigh_ins (user_id, logged_on desc);
create index if not exists vital_food_logs_user_day_idx on public.vital_food_logs (user_id, logged_on desc, created_at desc);

alter table public.vital_profiles enable row level security;
alter table public.vital_goals enable row level security;
alter table public.vital_weigh_ins enable row level security;
alter table public.vital_food_logs enable row level security;

drop policy if exists "Users can manage their vital profile" on public.vital_profiles;
create policy "Users can manage their vital profile" on public.vital_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their vital goals" on public.vital_goals;
create policy "Users can manage their vital goals" on public.vital_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their weigh-ins" on public.vital_weigh_ins;
create policy "Users can manage their weigh-ins" on public.vital_weigh_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their food logs" on public.vital_food_logs;
create policy "Users can manage their food logs" on public.vital_food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.vital_profiles, public.vital_goals, public.vital_weigh_ins, public.vital_food_logs to authenticated;
revoke all on public.vital_profiles, public.vital_goals, public.vital_weigh_ins, public.vital_food_logs from anon;
