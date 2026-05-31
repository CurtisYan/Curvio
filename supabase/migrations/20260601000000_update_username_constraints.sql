-- Normalize existing usernames and update constraints to require 4-20 chars (lowercase alnum + underscore)

-- 1) normalize to lowercase
update public.profiles
set username = lower(username)
where username is not null;

-- 2) pad short usernames to length 4 by appending 'x'
update public.profiles
set username = username || repeat('x', 4 - char_length(username))
where username is not null and char_length(username) < 4;

-- 3) truncate long usernames to 20 chars
update public.profiles
set username = left(username, 20)
where username is not null and char_length(username) > 20;

-- 4) resolve duplicates by appending short id suffix for any remaining duplicate usernames
with duplicates as (
  select username
  from public.profiles
  group by username
  having count(*) > 1
), duplicated_rows as (
  select p.id, p.username, row_number() over (partition by p.username order by p.id) as rn
  from public.profiles p
  where p.username in (select username from duplicates)
)
update public.profiles p
set username = left(p.username, 14) || '_' || substr(p.id::text, 1, 5)
from duplicated_rows d
where p.id = d.id and d.rn > 1;

-- final safety lowercase pass
update public.profiles
set username = lower(username)
where username is not null;

-- Drop old constraints if present
alter table public.profiles
drop constraint if exists profiles_username_format;

alter table public.profiles
drop constraint if exists profiles_username_length;

-- Add the new tighter format constraint and length constraint
alter table public.profiles
add constraint profiles_username_format
check (username ~ '^[a-z0-9_]+$');

alter table public.profiles
add constraint profiles_username_length
check (char_length(username) between 4 and 20);

-- ensure display_name length remains reasonable (keep existing rule)
alter table public.profiles
drop constraint if exists profiles_display_name_length;

alter table public.profiles
add constraint profiles_display_name_length
check (char_length(display_name) between 2 and 40);
