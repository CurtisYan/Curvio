alter table public.profiles
add column if not exists preferred_editor_mode text not null default 'markdown';

alter table public.profiles
drop constraint if exists profiles_preferred_editor_mode_check;

alter table public.profiles
add constraint profiles_preferred_editor_mode_check
check (preferred_editor_mode in ('markdown', 'plain'));
