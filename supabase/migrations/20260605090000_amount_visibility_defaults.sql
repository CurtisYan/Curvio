alter table public.records
  alter column show_amount set default true;

drop view if exists public.public_records;

create view public.public_records as
select
  records.id,
  records.type,
  records.title,
  records.content,
  records.reflection,
  records.date,
  records.is_anonymous,
  case when records.show_amount then records.amount else null end as amount,
  case when records.show_amount and records.amount is not null then records.currency else null end as currency,
  (records.show_amount and records.amount is not null) as show_amount,
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
