alter table public.profiles
add column if not exists last_donation_currency text;

alter table public.profiles
drop constraint if exists profiles_last_donation_currency_check;

alter table public.profiles
add constraint profiles_last_donation_currency_check
check (
  last_donation_currency is null
  or last_donation_currency in ('USD', 'CNY', 'EUR', 'JPY', 'GBP', 'HKD')
);

alter table public.profiles
drop constraint if exists profiles_preferred_editor_mode_check;

alter table public.profiles
drop column if exists preferred_editor_mode;
