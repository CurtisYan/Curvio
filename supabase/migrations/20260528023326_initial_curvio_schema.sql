create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  location text,
  principle text,
  website_url text,
  github_url text,
  blog_url text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'zh')),
  is_public boolean not null default true,
  allow_follow boolean not null default true,
  show_annual_summary boolean not null default true,
  hide_amounts_by_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('donation', 'kindness', 'open_source')),
  title text not null,
  organization_name text,
  platform_name text,
  project_url text,
  amount numeric(12, 2),
  currency text,
  show_amount boolean not null default false,
  content text not null,
  reflection text,
  date date not null,
  tags text[] not null default '{}',
  language text not null default 'en' check (language in ('en', 'zh')),
  is_public boolean not null default true,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.open_source_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null,
  repo_url text not null,
  demo_url text,
  screenshot_url text,
  license text,
  tech_stack text[] not null default '{}',
  status text not null default 'Building' check (status in ('Planning', 'Building', 'Active', 'Maintained', 'Paused', 'Archived')),
  is_free boolean not null default true,
  is_open_source boolean not null default true,
  is_public boolean not null default true,
  language text not null default 'en' check (language in ('en', 'zh')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_no_self_follow check (follower_id <> following_id),
  constraint follows_unique_pair unique (follower_id, following_id)
);

create table public.profile_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  section_type text not null check (section_type in ('donations', 'kindness', 'open_source', 'annual_summary', 'about', 'timeline', 'favorite_platforms')),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_sections_unique_section unique (user_id, section_type)
);

create table public.donation_platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  official_url text not null,
  official_url_zh text,
  region text,
  languages text[] not null default '{}',
  category text,
  is_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger records_set_updated_at
before update on public.records
for each row execute function public.set_updated_at();

create trigger open_source_projects_set_updated_at
before update on public.open_source_projects
for each row execute function public.set_updated_at();

create trigger profile_sections_set_updated_at
before update on public.profile_sections
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text;
begin
  generated_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
  );

  insert into public.profiles (id, username, display_name, preferred_language)
  values (
    new.id,
    generated_username,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), generated_username),
    case when new.raw_user_meta_data->>'preferred_language' in ('en', 'zh')
      then new.raw_user_meta_data->>'preferred_language'
      else 'en'
    end
  );

  insert into public.profile_sections (user_id, section_type, sort_order, is_visible)
  values
    (new.id, 'timeline', 1, true),
    (new.id, 'donations', 2, true),
    (new.id, 'kindness', 3, true),
    (new.id, 'open_source', 4, true),
    (new.id, 'annual_summary', 5, true);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.open_source_projects enable row level security;
alter table public.follows enable row level security;
alter table public.profile_sections enable row level security;
alter table public.donation_platforms enable row level security;

create policy "Public profiles are readable"
on public.profiles for select
using (is_public = true or auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public records are readable"
on public.records for select
using (is_public = true or auth.uid() = user_id);

create policy "Users can insert their own records"
on public.records for insert
with check (auth.uid() = user_id);

create policy "Users can update their own records"
on public.records for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own records"
on public.records for delete
using (auth.uid() = user_id);

create policy "Public projects are readable"
on public.open_source_projects for select
using (is_public = true or auth.uid() = user_id);

create policy "Users can insert their own projects"
on public.open_source_projects for insert
with check (auth.uid() = user_id and is_free = true and is_open_source = true);

create policy "Users can update their own projects"
on public.open_source_projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id and is_free = true and is_open_source = true);

create policy "Users can delete their own projects"
on public.open_source_projects for delete
using (auth.uid() = user_id);

create policy "Follows are readable"
on public.follows for select
using (true);

create policy "Users can follow others"
on public.follows for insert
with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
on public.follows for delete
using (auth.uid() = follower_id);

create policy "Users can read their profile sections"
on public.profile_sections for select
using (auth.uid() = user_id or exists (
  select 1 from public.profiles
  where profiles.id = profile_sections.user_id and profiles.is_public = true
));

create policy "Users can update their profile sections"
on public.profile_sections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Donation platforms are publicly readable"
on public.donation_platforms for select
using (true);

insert into public.donation_platforms
  (name, description, official_url, official_url_zh, region, languages, category)
values
  ('UNICEF', 'Working to defend children''s rights and help them fulfil their potential.', 'https://www.unicef.org/', 'https://support.unhcr.cn/joinfundraising/', 'Global', array['EN', 'FR', 'ES', 'ZH'], 'Children'),
  ('ICRC / Red Cross', 'Humanitarian assistance for people affected by conflict, disasters, and emergencies.', 'https://www.icrc.org/', 'https://www.icrc.org/zh/where-we-work/china', 'Global', array['Multi-lang'], 'Humanitarian'),
  ('World Food Programme', 'Food assistance in emergencies and long-term nutrition programs.', 'https://www.wfp.org/', 'https://zh.wfp.org/', 'Global', array['EN', 'FR', 'ES', 'ZH'], 'Food security'),
  ('Tencent Public Welfare', 'A Chinese internet charity platform connecting donors with verified charitable organizations.', 'https://gongyi.qq.com/', 'https://gongyi.qq.com/', 'China / Asia', array['ZH'], 'Public welfare');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('proofs', 'proofs', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Avatar images are public"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload avatar images to own folder"
on storage.objects for insert
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar images"
on storage.objects for update
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own avatar images"
on storage.objects for delete
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own proof files"
on storage.objects for select
using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload proof files to own folder"
on storage.objects for insert
with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own proof files"
on storage.objects for delete
using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
