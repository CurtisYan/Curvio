create table public.record_images (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  r2_key text not null,
  r2_url text not null,
  mime_type text not null,
  file_size bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index record_images_record_id_idx on public.record_images (record_id);
create index record_images_user_id_idx on public.record_images (user_id);

alter table public.record_images enable row level security;

create policy "Public record images are readable"
on public.record_images for select
using (
  exists (
    select 1 from public.records
    where records.id = record_images.record_id
      and records.is_public = true
  )
  or auth.uid() = user_id
);

create policy "Users can insert their record images"
on public.record_images for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.records
    where records.id = record_images.record_id
      and records.user_id = auth.uid()
  )
);

create policy "Users can delete their record images"
on public.record_images for delete
using (auth.uid() = user_id);
