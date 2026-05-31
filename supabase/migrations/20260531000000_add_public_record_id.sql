alter table public.records
add column if not exists public_record_id text;

update public.records
set public_record_id = replace(date::text, '-', '') || '-' || id::text
where public_record_id is null;

alter table public.records
alter column public_record_id set not null;

create unique index if not exists records_public_record_id_key
on public.records (public_record_id);

create or replace function public.set_record_public_id()
returns trigger
language plpgsql
as $$
begin
  new.public_record_id := replace(new.date::text, '-', '') || '-' || new.id::text;
  return new;
end;
$$;

drop trigger if exists records_set_public_record_id on public.records;

create trigger records_set_public_record_id
before insert or update of date on public.records
for each row execute function public.set_record_public_id();