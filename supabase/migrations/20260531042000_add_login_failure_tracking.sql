create table if not exists public.login_failures (
  id uuid primary key default gen_random_uuid(),
  email_hash text not null,
  ip_address inet not null,
  created_at timestamptz not null default now()
);

create index if not exists login_failures_email_created_at_idx
on public.login_failures (email_hash, created_at desc);

create index if not exists login_failures_ip_created_at_idx
on public.login_failures (ip_address, created_at desc);