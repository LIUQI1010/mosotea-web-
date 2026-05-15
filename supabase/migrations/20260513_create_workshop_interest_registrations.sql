create extension if not exists pgcrypto;

create table if not exists public.workshop_interest_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  guest_count integer not null check (guest_count between 1 and 8),
  message text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'zh-TW')),
  availability_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workshop_interest_registrations_created_at_idx
  on public.workshop_interest_registrations (created_at desc);

create index if not exists workshop_interest_registrations_email_idx
  on public.workshop_interest_registrations (lower(email));

create or replace function public.set_workshop_interest_registrations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workshop_interest_registrations_set_updated_at
  on public.workshop_interest_registrations;

create trigger workshop_interest_registrations_set_updated_at
before update on public.workshop_interest_registrations
for each row
execute function public.set_workshop_interest_registrations_updated_at();

alter table public.workshop_interest_registrations enable row level security;
