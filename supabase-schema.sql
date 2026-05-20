-- Supabase table for Gym Helper app state sync.
-- Run this in Supabase Dashboard -> SQL Editor -> New query.

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
alter table public.app_state replica identity full;

drop policy if exists "Users can read their own app state" on public.app_state;
drop policy if exists "Users can insert their own app state" on public.app_state;
drop policy if exists "Users can update their own app state" on public.app_state;
drop policy if exists "Users can delete their own app state" on public.app_state;

create policy "Users can read their own app state"
  on public.app_state
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own app state"
  on public.app_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own app state"
  on public.app_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own app state"
  on public.app_state
  for delete
  to authenticated
  using (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.app_state;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
