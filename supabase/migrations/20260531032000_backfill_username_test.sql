do $$
declare
  target_user_id uuid;
  conflict_profile_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = 'realthat@icloud.com'
  limit 1;

  if target_user_id is null then
    raise notice 'Target email not found, skipping username backfill.';
    return;
  end if;

  select id
  into conflict_profile_id
  from public.profiles
  where username = 'test'
    and id <> target_user_id
  limit 1;

  if conflict_profile_id is not null then
    raise exception 'Cannot set username to test: already used by profile %', conflict_profile_id;
  end if;

  update public.profiles
  set username = 'test',
      updated_at = now()
  where id = target_user_id;

  raise notice 'Username backfill complete for user %', target_user_id;
end;
$$;
