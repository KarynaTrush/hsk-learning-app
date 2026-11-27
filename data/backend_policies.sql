drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);

do $$
begin
  alter table public.user_progress add constraint user_progress_state_size check (pg_column_size(state) < 2097152) not valid;
exception when duplicate_object then null;
end $$;
