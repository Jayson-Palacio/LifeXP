-- Kaeluma catch-up — run this once in the Supabase SQL editor.
-- Safe to re-run. For an existing household that already has Quests and Vital,
-- this is everything still missing: Ledger tables, Table meal plans,
-- monthly envelopes (including custom ones), RLS, and grants.

create table if not exists public.ledger_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  monthly_income numeric(12,2) not null default 0
    check (monthly_income >= 0 and monthly_income <= 10000000),
  yearly_goal numeric(12,2)
    check (yearly_goal is null or (yearly_goal >= 0 and yearly_goal <= 100000000)),
  allocations jsonb not null default '{}'::jsonb,
  envelopes jsonb not null default '[]'::jsonb,
  currency text not null default 'USD' check (char_length(currency) = 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ledger_settings
  add column if not exists allocations jsonb not null default '{}'::jsonb;

alter table public.ledger_settings
  add column if not exists envelopes jsonb not null default '[]'::jsonb;

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  amount numeric(12,2) not null check (amount > 0 and amount <= 10000000),
  kind text not null default 'spend' check (kind in ('spend', 'income')),
  category text not null check (char_length(category) between 1 and 40),
  note text check (note is null or char_length(note) <= 80),
  created_at timestamptz not null default now()
);

create index if not exists ledger_settings_owner_idx on public.ledger_settings (owner_id);
create index if not exists ledger_entries_owner_day_idx
  on public.ledger_entries (owner_id, logged_on desc, created_at desc);

alter table public.ledger_settings enable row level security;
alter table public.ledger_entries enable row level security;

drop policy if exists "Owners manage ledger settings" on public.ledger_settings;
create policy "Owners manage ledger settings" on public.ledger_settings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "Owners manage ledger entries" on public.ledger_entries;
create policy "Owners manage ledger entries" on public.ledger_entries
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select, insert, update, delete on public.ledger_settings, public.ledger_entries to authenticated;
revoke all on public.ledger_settings, public.ledger_entries from anon;

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

alter table public.app_settings
  add column if not exists hidden_apps jsonb not null default '[]'::jsonb;
