-- Kaeluma Table — weekly meal plan and grocery list
-- Run in the Supabase SQL editor. Safe to re-run.

create table if not exists public.table_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  meals jsonb not null default '{}'::jsonb,
  grocery jsonb not null default '[]'::jsonb,
  extras jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, week_start)
);

create index if not exists table_plans_owner_week_idx
  on public.table_plans (owner_id, week_start desc);

alter table public.table_plans enable row level security;

drop policy if exists "Owners manage table plans" on public.table_plans;
create policy "Owners manage table plans" on public.table_plans
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select, insert, update, delete on public.table_plans to authenticated;
revoke all on public.table_plans from anon;
