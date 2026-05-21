-- supabase/migrations/20260521000001_profiles.sql
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  age_group    text check (age_group in ('3-5', '6-8', '9-12')),
  learn_lang   text check (learn_lang in ('ar', 'en')),
  ui_lang      text check (ui_lang in ('ar', 'en')) default 'ar',
  is_premium   boolean default false,
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);
