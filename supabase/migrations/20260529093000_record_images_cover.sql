alter table public.record_images
add column if not exists is_cover boolean not null default false;

create unique index if not exists record_images_cover_unique
on public.record_images (record_id)
where is_cover;

create policy "Users can update their record images"
on public.record_images for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
