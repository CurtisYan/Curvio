-- profile username/display_name constraints

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
