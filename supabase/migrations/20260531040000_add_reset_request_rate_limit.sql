create table if not exists public.reset_requests (
  id uuid primary key default gen_random_uuid(),
  ip_address inet not null,
  email_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists reset_requests_ip_email_created_at_idx
on public.reset_requests (ip_address, email_hash, created_at desc);

create or replace function public.consume_reset_request_limit(
  p_ip_address text,
  p_email_hash text,
  p_window_minutes integer default 15,
  p_limit integer default 3
)
returns table (
  allowed boolean,
  attempts integer,
  retry_after timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  window_start timestamptz := now() - make_interval(mins => p_window_minutes);
  current_attempts integer;
  next_allowed_at timestamptz;
begin
  select count(*)::integer
  into current_attempts
  from public.reset_requests
  where ip_address = p_ip_address::inet
    and email_hash = p_email_hash
    and created_at >= window_start;

  if current_attempts >= p_limit then
    select min(created_at) + make_interval(mins => p_window_minutes)
    into next_allowed_at
    from public.reset_requests
    where ip_address = p_ip_address::inet
      and email_hash = p_email_hash
      and created_at >= window_start;

    allowed := false;
    attempts := current_attempts;
    retry_after := next_allowed_at;
    return next;
  end if;

  insert into public.reset_requests (ip_address, email_hash)
  values (p_ip_address::inet, p_email_hash);

  allowed := true;
  attempts := current_attempts + 1;
  retry_after := null;
  return next;
end;
$$;