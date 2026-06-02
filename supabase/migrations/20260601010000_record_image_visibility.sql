alter table public.record_images
add column if not exists visibility text not null default 'public';

alter table public.record_images
drop constraint if exists record_images_visibility_check;

alter table public.record_images
add constraint record_images_visibility_check
check (visibility in ('public', 'private'));

drop policy if exists "Public record images are readable" on public.record_images;

create policy "Public record images are readable"
on public.record_images for select
using (
  (
    visibility = 'public'
    and exists (
      select 1 from public.records
      where records.id = record_images.record_id
        and records.is_public = true
    )
  )
  or auth.uid() = user_id
);
