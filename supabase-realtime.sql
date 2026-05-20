-- Run this after supabase-schema.sql to enable live updates between devices.
-- Supabase Dashboard -> SQL Editor -> New query -> paste and Run.

alter table public.app_state replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.app_state;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
