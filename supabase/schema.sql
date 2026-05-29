create extension if not exists pgcrypto;

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text not null,
  gender text not null,
  mbti text,
  speaking_style text not null,
  relationship_status text not null,
  context_note text,
  avatar_config jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint characters_relationship_check check (
    relationship in ('lover', 'crush', 'boss', 'hr', 'colleague', 'friend', 'family', 'other')
  ),
  constraint characters_gender_check check (gender in ('male', 'female', 'neutral'))
);

create table if not exists public.interpretations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  other_text text not null,
  optional_context text,
  literal text not null,
  real_talk text not null,
  hidden_mood text not null,
  danger_signal text not null,
  reply text not null,
  one_liner text not null,
  created_at timestamp with time zone default now()
);

create index if not exists characters_user_id_created_at_idx
  on public.characters(user_id, created_at desc);

create index if not exists interpretations_user_character_created_at_idx
  on public.interpretations(user_id, character_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.enforce_character_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.characters
    where user_id = new.user_id
  ) >= 5 then
    raise exception '免费版最多创建 5 个关系对象。';
  end if;

  return new;
end;
$$;

drop trigger if exists set_characters_updated_at on public.characters;
create trigger set_characters_updated_at
before update on public.characters
for each row execute function public.set_updated_at();

drop trigger if exists enforce_characters_limit on public.characters;
create trigger enforce_characters_limit
before insert on public.characters
for each row execute function public.enforce_character_limit();

alter table public.characters enable row level security;
alter table public.interpretations enable row level security;

drop policy if exists "Users can read own characters" on public.characters;
create policy "Users can read own characters"
on public.characters for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own characters" on public.characters;
create policy "Users can create own characters"
on public.characters for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own characters" on public.characters;
create policy "Users can update own characters"
on public.characters for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own characters" on public.characters;
create policy "Users can delete own characters"
on public.characters for delete
using (auth.uid() = user_id);

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
