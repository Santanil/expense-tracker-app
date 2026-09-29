-- ============================================================
-- Expense Tracker — Supabase schema
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- Enable UUID generation (usually already on in Supabase, safe to re-run)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- expenses
-- ------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  category text not null,
  description text,
  spend_type text not null check (spend_type in ('credit', 'debit')),
  method text not null check (method in ('card', 'upi', 'wallet', 'bank_transfer')),
  instrument_name text,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_date_idx on public.expenses (user_id, date);

-- ------------------------------------------------------------
-- budgets  (one row per user per month/year)
-- ------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null,
  budget_amount numeric(12,2) not null check (budget_amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month, year)
);

-- ------------------------------------------------------------
-- assets
-- ------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_name text not null,
  asset_type text not null check (
    asset_type in ('FD','MF','PF','PPF','Stocks','Bonds','RSU','ESPP')
  ),
  status text not null check (status in ('Active','Dormant','Closed')),
  start_date date,
  end_date date,
  account_number text,
  amount_invested numeric(14,2) not null default 0,
  amount_expected_maturity numeric(14,2),
  created_at timestamptz not null default now()
);

create index if not exists assets_user_idx on public.assets (user_id);

-- ------------------------------------------------------------
-- user_settings  (one row per user — custom category list and
-- card/UPI/wallet/bank instrument list; falls back to app defaults /
-- auto-detected history when no row exists)
--
-- `instruments` is a jsonb array of {"name": string, "method": one of
-- 'card'|'upi'|'wallet'|'bank_transfer'} objects — every instrument name
-- is tied to exactly one Method (see src/lib/expenses.ts's Instrument
-- type). This superseded the earlier flat `instrument_names text[]`
-- column, which had no way to associate a name with a Method, letting
-- the add-expense form offer any name regardless of the selected
-- Method. If you're running this against a live project that already
-- has the old column, see the migration block further down instead of
-- re-running this CREATE TABLE (it's a no-op on an existing table).
-- ------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  categories text[] not null default array[
    'Food','Travel','Rent','Utilities','Shopping','Bills','Entertainment','Health','Other'
  ],
  instruments jsonb not null default '[{"name":"Cash","method":"wallet"}]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row-Level Security — every table is locked to auth.uid()
-- ============================================================

alter table public.expenses      enable row level security;
alter table public.budgets       enable row level security;
alter table public.assets        enable row level security;
alter table public.user_settings enable row level security;

-- expenses policies
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

-- budgets policies
create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- assets policies
create policy "assets_select_own" on public.assets
  for select using (auth.uid() = user_id);
create policy "assets_insert_own" on public.assets
  for insert with check (auth.uid() = user_id);
create policy "assets_update_own" on public.assets
  for update using (auth.uid() = user_id);
create policy "assets_delete_own" on public.assets
  for delete using (auth.uid() = user_id);

-- user_settings policies (no delete — it's a singleton row per user)
create policy "user_settings_select_own" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings
  for update using (auth.uid() = user_id);

-- ============================================================
-- MIGRATION — only needed on an existing live project whose
-- user_settings table still has the old `instrument_names text[]`
-- column (no Method tag per name). Skip entirely on a brand new
-- project created fresh from the CREATE TABLE above. Run in the
-- Supabase SQL editor (only the anon key is available to the app
-- itself, so this can't be run for you automatically).
-- ============================================================

-- 1) Add the new column (no-op if it already exists).
alter table public.user_settings
  add column if not exists instruments jsonb not null default '[{"name":"Cash","method":"wallet"}]'::jsonb;

-- 2) Backfill from the old text[] column, guessing each name's Method
--    from whichever method was most recently logged against that
--    instrument_name in your expense history (falls back to 'card' for
--    a name with no matching expense at all). This is a best-effort
--    guess — open Settings afterward and correct any Method that
--    guessed wrong.
update public.user_settings us
set instruments = coalesce(
  (
    select jsonb_agg(jsonb_build_object(
      'name', name,
      'method', coalesce(
        (
          select e.method
          from public.expenses e
          where e.user_id = us.user_id and e.instrument_name = name
          order by e.created_at desc
          limit 1
        ),
        'card'
      )
    ))
    from unnest(us.instrument_names) as name
  ),
  '[{"name":"Cash","method":"wallet"}]'::jsonb
)
where us.instrument_names is not null and array_length(us.instrument_names, 1) > 0;

-- 3) Once Settings looks right in the app, drop the superseded column:
-- alter table public.user_settings drop column instrument_names;
