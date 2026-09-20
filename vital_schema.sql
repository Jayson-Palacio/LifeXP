-- Kaeluma Vital — household health (people, plans, meals, weigh-ins)
-- Run in the Supabase SQL editor. Safe to re-run.
-- Copies data from the earlier single-user tables when they exist.

create table if not exists public.vital_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  kind text not null default 'adult' check (kind in ('adult', 'child')),
  sex text check (sex in ('male', 'female')),
  birth_year integer check (birth_year is null or birth_year between 1920 and 2025),
  height_cm numeric(5,1) check (height_cm is null or height_cm between 70 and 250),
  activity_level text not null default 'moderate'
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  units text not null default 'us' check (units in ('us', 'metric')),
  accent text not null default '#2f5d50',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vital_plans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.vital_members(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  intent text not null default 'maintain' check (intent in ('lose', 'maintain', 'gain', 'grow')),
  start_weight_kg numeric(5,1) check (start_weight_kg is null or start_weight_kg between 10 and 400),
  current_weight_kg numeric(5,1) check (current_weight_kg is null or current_weight_kg between 10 and 400),
  target_weight_kg numeric(5,1) check (target_weight_kg is null or target_weight_kg between 10 and 400),
  weekly_change_kg numeric(4,2) not null default 0 check (weekly_change_kg between 0 and 1.2),
  calorie_target integer check (calorie_target is null or calorie_target between 800 and 6000),
  protein_target_g integer check (protein_target_g is null or protein_target_g between 20 and 400),
  carbs_target_g integer check (carbs_target_g is null or carbs_target_g between 0 and 800),
  fat_target_g integer check (fat_target_g is null or fat_target_g between 15 and 250),
  updated_at timestamptz not null default now()
);

create table if not exists public.vital_weights (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.vital_members(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  weight_kg numeric(5,1) not null check (weight_kg between 10 and 400),
  created_at timestamptz not null default now(),
  unique (member_id, logged_on)
);

create table if not exists public.vital_foods (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.vital_members(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  meal text not null default 'snack' check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null check (char_length(name) between 1 and 120),
  calories integer not null check (calories between 0 and 5000),
  protein_g numeric(6,1) not null default 0 check (protein_g between 0 and 400),
  carbs_g numeric(6,1) not null default 0 check (carbs_g between 0 and 800),
  fat_g numeric(6,1) not null default 0 check (fat_g between 0 and 250),
  created_at timestamptz not null default now()
);

create index if not exists vital_members_owner_idx on public.vital_members (owner_id, created_at);
create index if not exists vital_weights_member_day_idx on public.vital_weights (member_id, logged_on desc);
create index if not exists vital_foods_member_day_idx on public.vital_foods (member_id, logged_on desc, created_at desc);

alter table public.vital_members enable row level security;
alter table public.vital_plans enable row level security;
alter table public.vital_weights enable row level security;
alter table public.vital_foods enable row level security;

drop policy if exists "Owners manage vital members" on public.vital_members;
create policy "Owners manage vital members" on public.vital_members
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Owners manage vital plans" on public.vital_plans;
create policy "Owners manage vital plans" on public.vital_plans
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Owners manage vital weights" on public.vital_weights;
create policy "Owners manage vital weights" on public.vital_weights
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Owners manage vital foods" on public.vital_foods;
create policy "Owners manage vital foods" on public.vital_foods
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select, insert, update, delete on public.vital_members, public.vital_plans, public.vital_weights, public.vital_foods to authenticated;
revoke all on public.vital_members, public.vital_plans, public.vital_weights, public.vital_foods from anon;

create table if not exists public.vital_kitchen (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  calories integer not null check (calories between 0 and 5000),
  protein_g numeric(6,1) not null default 0 check (protein_g between 0 and 400),
  carbs_g numeric(6,1) not null default 0 check (carbs_g between 0 and 800),
  fat_g numeric(6,1) not null default 0 check (fat_g between 0 and 250),
  barcode text,
  times_logged integer not null default 1 check (times_logged >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);

create index if not exists vital_kitchen_owner_idx on public.vital_kitchen (owner_id, times_logged desc);

alter table public.vital_kitchen enable row level security;

drop policy if exists "Owners manage vital kitchen" on public.vital_kitchen;
create policy "Owners manage vital kitchen" on public.vital_kitchen
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select, insert, update, delete on public.vital_kitchen to authenticated;
revoke all on public.vital_kitchen from anon;

alter table public.vital_plans
  add column if not exists method text not null default 'high_protein',
  add column if not exists calorie_override integer,
  add column if not exists protein_override integer,
  add column if not exists carbs_override integer,
  add column if not exists fat_override integer,
  add column if not exists fiber_target_g integer,
  add column if not exists eat_back text not null default 'off';

alter table public.vital_foods
  add column if not exists fiber_g numeric(6,1) not null default 0;

alter table public.vital_kitchen
  add column if not exists fiber_g numeric(6,1) not null default 0;

do $$
begin
  alter table public.vital_plans drop constraint if exists vital_plans_method_check;
  alter table public.vital_plans add constraint vital_plans_method_check
    check (method in ('high_protein', 'balanced', 'simple', 'custom'));
  alter table public.vital_plans drop constraint if exists vital_plans_eat_back_check;
  alter table public.vital_plans add constraint vital_plans_eat_back_check
    check (eat_back in ('off', 'half', 'full'));
end $$;

create table if not exists public.vital_activity (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.vital_members(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  kind text not null check (kind in ('walk', 'run', 'bike', 'lift', 'play', 'other')),
  minutes integer not null check (minutes between 1 and 480),
  effort text not null default 'moderate' check (effort in ('easy', 'moderate', 'hard')),
  kcal_est integer not null default 0 check (kcal_est between 0 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists vital_activity_member_day_idx on public.vital_activity (member_id, logged_on desc, created_at desc);

alter table public.vital_activity enable row level security;

drop policy if exists "Owners manage vital activity" on public.vital_activity;
create policy "Owners manage vital activity" on public.vital_activity
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select, insert, update, delete on public.vital_activity to authenticated;
revoke all on public.vital_activity from anon;

create table if not exists public.vital_moves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  kind text not null check (kind in ('walk', 'run', 'bike', 'lift', 'play', 'other')),
  minutes integer not null check (minutes between 1 and 480),
  effort text not null default 'moderate' check (effort in ('easy', 'moderate', 'hard')),
  times_logged integer not null default 1 check (times_logged >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, label)
);

create index if not exists vital_moves_owner_idx on public.vital_moves (owner_id, times_logged desc);

alter table public.vital_moves enable row level security;

drop policy if exists "Owners manage vital moves" on public.vital_moves;
create policy "Owners manage vital moves" on public.vital_moves
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select, insert, update, delete on public.vital_moves to authenticated;
revoke all on public.vital_moves from anon;

alter table public.vital_activity
  add column if not exists steps integer,
  add column if not exists note text;

alter table public.vital_plans
  add column if not exists step_goal integer;

alter table public.vital_kitchen
  add column if not exists pin_rank integer;

do $$
begin
  alter table public.vital_activity drop constraint if exists vital_activity_kind_check;
  alter table public.vital_activity add constraint vital_activity_kind_check
    check (kind in ('walk', 'run', 'bike', 'lift', 'play', 'other', 'steps', 'swim', 'yoga', 'hiit', 'sport'));
  alter table public.vital_activity drop constraint if exists vital_activity_steps_check;
  alter table public.vital_activity add constraint vital_activity_steps_check
    check (steps is null or steps between 100 and 100000);
  alter table public.vital_activity drop constraint if exists vital_activity_note_check;
  alter table public.vital_activity add constraint vital_activity_note_check
    check (note is null or char_length(note) between 1 and 80);
  alter table public.vital_moves drop constraint if exists vital_moves_kind_check;
  alter table public.vital_moves add constraint vital_moves_kind_check
    check (kind in ('walk', 'run', 'bike', 'lift', 'play', 'other', 'steps', 'swim', 'yoga', 'hiit', 'sport'));
  alter table public.vital_plans drop constraint if exists vital_plans_step_goal_check;
  alter table public.vital_plans add constraint vital_plans_step_goal_check
    check (step_goal is null or step_goal between 1000 and 40000);
  alter table public.vital_kitchen drop constraint if exists vital_kitchen_pin_rank_check;
  alter table public.vital_kitchen add constraint vital_kitchen_pin_rank_check
    check (pin_rank is null or pin_rank between 1 and 40);
end $$;

-- Copy the original single-user Vital rows into household tables once.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'vital_profiles'
  ) then
    insert into public.vital_members (owner_id, display_name, kind, sex, birth_year, height_cm, activity_level, units)
    select p.user_id, 'You', 'adult', p.sex, p.birth_year, p.height_cm, p.activity_level, p.units
    from public.vital_profiles p
    where not exists (
      select 1 from public.vital_members m where m.owner_id = p.user_id
    );

    insert into public.vital_plans (
      member_id, owner_id, intent, start_weight_kg, current_weight_kg, target_weight_kg,
      weekly_change_kg, calorie_target, protein_target_g, carbs_target_g, fat_target_g
    )
    select m.id, g.user_id,
      case when g.target_weight_kg < g.current_weight_kg - 0.4 then 'lose'
           when g.target_weight_kg > g.current_weight_kg + 0.4 then 'gain'
           else 'maintain' end,
      g.start_weight_kg, g.current_weight_kg, g.target_weight_kg, g.weekly_loss_kg,
      g.calorie_target, g.protein_target_g, g.carbs_target_g, g.fat_target_g
    from public.vital_goals g
    join public.vital_members m on m.owner_id = g.user_id
    where not exists (select 1 from public.vital_plans p where p.member_id = m.id);

    insert into public.vital_weights (member_id, owner_id, logged_on, weight_kg, created_at)
    select m.id, w.user_id, w.logged_on, w.weight_kg, w.created_at
    from public.vital_weigh_ins w
    join public.vital_members m on m.owner_id = w.user_id
    on conflict (member_id, logged_on) do nothing;

    insert into public.vital_foods (member_id, owner_id, logged_on, meal, name, calories, protein_g, carbs_g, fat_g, created_at)
    select m.id, f.user_id, f.logged_on, f.meal, f.name, f.calories, f.protein_g, f.carbs_g, f.fat_g, f.created_at
    from public.vital_food_logs f
    join public.vital_members m on m.owner_id = f.user_id
    where not exists (
      select 1 from public.vital_foods nf
      where nf.member_id = m.id and nf.logged_on = f.logged_on and nf.name = f.name and nf.created_at = f.created_at
    );
do $$
begin
  alter table public.vital_foods drop constraint if exists vital_foods_meal_check;
  alter table public.vital_foods add constraint vital_foods_meal_check
    check (meal in ('breakfast', 'lunch', 'dinner', 'snack', 'drink'));
end $$;
