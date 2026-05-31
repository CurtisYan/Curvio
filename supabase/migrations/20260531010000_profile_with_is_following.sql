-- adds an RPC to fetch profile with a precomputed is_following flag
create or replace function public.get_profile_with_follow_status(viewer_uuid uuid, username_text text)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  principle text,
  location text,
  website_url text,
  github_url text,
  allow_follow boolean,
  is_public boolean,
  is_following boolean
)
language sql stable as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.principle,
    p.location,
    p.website_url,
    p.github_url,
    p.allow_follow,
    p.is_public,
    case when viewer_uuid is null then false
      else exists(select 1 from public.follows f where f.follower_id = viewer_uuid and f.following_id = p.id)
    end as is_following
  from public.profiles p
  where p.username = username_text
  limit 1;
$$;
