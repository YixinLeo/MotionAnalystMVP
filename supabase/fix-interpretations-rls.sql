alter table public.interpretations enable row level security;

drop policy if exists "Users can read own interpretations" on public.interpretations;
create policy "Users can read own interpretations"
on public.interpretations for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own interpretations" on public.interpretations;
create policy "Users can create own interpretations"
on public.interpretations for insert
with check (
  auth.uid() = user_id
  and character_id in (
    select id
    from public.characters
    where user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own interpretations" on public.interpretations;
create policy "Users can delete own interpretations"
on public.interpretations for delete
using (auth.uid() = user_id);
