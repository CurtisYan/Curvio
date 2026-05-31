-- profile username/display_name constraints + deletion request workflow table

alter table public.profiles
drop constraint if exists profiles_username_format;

alter table public.profiles
drop constraint if exists profiles_username_length;

alter table public.profiles
drop constraint if exists profiles_display_name_length;

update public.profiles
set username = lower(username);

alter table public.profiles
add constraint profiles_username_format
check (username ~ '^[a-z0-9_]+$');

alter table public.profiles
add constraint profiles_username_length
check (char_length(username) between 3 and 24);

alter table public.profiles
add constraint profiles_display_name_length
check (char_length(display_name) between 2 and 40);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_content text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected')),
  processed_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz
);

drop trigger if exists deletion_requests_set_updated_at on public.deletion_requests;

create trigger deletion_requests_set_updated_at
before update on public.deletion_requests
for each row execute function public.set_updated_at();

alter table public.deletion_requests enable row level security;

drop policy if exists "Users can insert their own deletion requests" on public.deletion_requests;
create policy "Users can insert their own deletion requests"
on public.deletion_requests for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own deletion requests" on public.deletion_requests;
create policy "Users can read their own deletion requests"
on public.deletion_requests for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text;
begin
  generated_username := lower(coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
  ));

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
