-- supabase/migrations/20260521000002_game_progress.sql
create table public.game_progress (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  game_id      text not null,
  lang         text not null check (lang in ('ar', 'en')),
  level_index  int  not null check (level_index >= 0),
  stars        int  not null check (stars between 1 and 3),
  updated_at   timestamptz not null default now(),
  unique (profile_id, game_id, lang, level_index)
);

alter table public.game_progress enable row level security;

create policy "game_progress_select_own"
  on public.game_progress for select
  using (auth.uid() = profile_id);

create policy "game_progress_insert_own"
  on public.game_progress for insert
  with check (auth.uid() = profile_id);

create policy "game_progress_update_own"
  on public.game_progress for update
  using (auth.uid() = profile_id);
