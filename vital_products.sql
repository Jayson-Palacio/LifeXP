-- Everyday Walmart / Sam's Club grocery foods for Vital search and barcode scan.
-- Run in the Supabase SQL editor, then: py -3 scripts/import_vital_products.py --apply
-- Does not change household profiles. Safe to re-run.

create table if not exists public.vital_products (
  barcode text primary key check (char_length(barcode) between 4 and 32),
  name text not null check (char_length(name) between 1 and 120),
  brand text,
  store text not null default 'walmart' check (store in ('walmart', 'sams', 'both')),
  calories integer not null check (calories between 0 and 5000),
  protein_g numeric(6,1) not null default 0 check (protein_g between 0 and 400),
  carbs_g numeric(6,1) not null default 0 check (carbs_g between 0 and 800),
  fat_g numeric(6,1) not null default 0 check (fat_g between 0 and 250),
  fiber_g numeric(6,1) not null default 0 check (fiber_g between 0 and 200),
  serving text,
  source text not null default 'usda',
  updated_at timestamptz not null default now()
);

create index if not exists vital_products_name_idx on public.vital_products (lower(name));
create index if not exists vital_products_brand_idx on public.vital_products (lower(brand));
create index if not exists vital_products_store_idx on public.vital_products (store);

alter table public.vital_products enable row level security;

drop policy if exists "Authenticated read vital products" on public.vital_products;
create policy "Authenticated read vital products" on public.vital_products
  for select to authenticated using (true);

grant select on public.vital_products to authenticated;
revoke all on public.vital_products from anon;

notify pgrst, 'reload schema';
