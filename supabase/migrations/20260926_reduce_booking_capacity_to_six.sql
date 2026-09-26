alter table public.time_slots
  alter column max_guests set default 6;

-- Preserve historical over-capacity sessions while preventing any new guests
-- from being added to them. All other existing sessions now have six places.
update public.time_slots
set max_guests = greatest(booked_guests, 6)
where max_guests is distinct from greatest(booked_guests, 6);

alter table public.bookings
  add constraint bookings_guest_count_max_six
  check (guest_count between 1 and 6) not valid;

alter table public.workshop_interest_registrations
  drop constraint if exists workshop_interest_registrations_guest_count_check;

alter table public.workshop_interest_registrations
  add constraint workshop_interest_registrations_guest_count_check
  check (guest_count between 1 and 6) not valid;
