alter table public.records
add column if not exists archived_at timestamptz;

create index if not exists records_user_archived_date_idx
on public.records (user_id, archived_at, date desc);
