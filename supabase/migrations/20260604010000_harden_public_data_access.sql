alter table public.reset_requests enable row level security;
alter table public.login_failures enable row level security;

revoke all on public.reset_requests from anon, authenticated;
revoke all on public.login_failures from anon, authenticated;

drop view if exists public.public_records;

create or replace function public.is_public_record_visible(record_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.records
    join public.profiles on profiles.id = records.user_id
    where records.id = record_uuid
      and records.is_public = true
      and records.archived_at is null
      and profiles.is_public = true
  );
$$;

create view public.public_records as
select
  records.id,
  records.type,
  records.title,
  records.content,
  records.reflection,
  records.date,
  records.is_anonymous,
  (records.amount is not null and records.show_amount = false) as amount_hidden,
  records.organization_name,
  records.platform_name,
  records.project_url,
  records.tags,
  records.language,
  records.public_record_id,
  profiles.username,
  profiles.display_name,
  profiles.avatar_url
from public.records
join public.profiles on profiles.id = records.user_id
where records.is_public = true
  and records.archived_at is null
  and profiles.is_public = true;

grant select on public.public_records to anon, authenticated;

drop policy if exists "Public records are readable" on public.records;

create policy "Users can read their own records"
on public.records for select
using (auth.uid() = user_id);

drop policy if exists "Public record images are readable" on public.record_images;

create policy "Public record images are readable"
on public.record_images for select
using (
  (
    visibility = 'public'
    and public.is_public_record_visible(record_id)
  )
  or auth.uid() = user_id
);
