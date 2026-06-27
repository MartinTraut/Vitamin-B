-- ============================================================
--  Vitamin B Organisations-Dashboard · Supabase-Schema
--  Einmalig im Supabase SQL-Editor ausführen (Projekt → SQL Editor → New query).
-- ============================================================

-- Eine Zeile pro Daten-Collection (tasks, appointments, customers, ...).
-- Der Inhalt liegt als JSON in `data`.
create table if not exists public.app_state (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Zugriff nur für angemeldete Nutzer (der geteilte Team-Account).
alter table public.app_state enable row level security;

drop policy if exists "team_read"   on public.app_state;
drop policy if exists "team_insert" on public.app_state;
drop policy if exists "team_update" on public.app_state;

create policy "team_read"
  on public.app_state for select
  using (auth.role() = 'authenticated');

create policy "team_insert"
  on public.app_state for insert
  with check (auth.role() = 'authenticated');

create policy "team_update"
  on public.app_state for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Echtzeit-Sync für diese Tabelle aktivieren.
alter publication supabase_realtime add table public.app_state;
