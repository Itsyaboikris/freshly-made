-- Order flow: names, pickup slot, new statuses; flyer-aligned product prices; email optional.
-- Run after 20260322190000_init.sql on existing projects.

alter table public.orders alter column customer_email drop not null;

alter table public.orders add column if not exists customer_first_name text;
alter table public.orders add column if not exists customer_last_name text;
alter table public.orders add column if not exists pickup_location_id text;
alter table public.orders add column if not exists pickup_slot_summary text;

update public.orders
set
  customer_first_name = coalesce(
    nullif(trim(split_part(customer_name, ' ', 1)), ''),
    'Customer'
  ),
  customer_last_name = coalesce(
    nullif(
      trim(
        substring(
          customer_name
          from length(split_part(customer_name, ' ', 1)) + 2
        )
      ),
      ''
    ),
    '-'
  )
where customer_first_name is null;

update public.orders set customer_first_name = 'Customer' where customer_first_name is null;
update public.orders set customer_last_name = '-' where customer_last_name is null;

alter table public.orders alter column customer_first_name set not null;
alter table public.orders alter column customer_last_name set not null;

update public.orders set status = 'delivered' where status = 'completed';
update public.orders set status = 'out_for_delivery' where status = 'ready';
update public.orders set status = 'confirmed' where status = 'in_prep';

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders add constraint orders_status_check check (
  status in (
    'pending',
    'paid',
    'confirmed',
    'out_for_delivery',
    'delivered',
    'cancelled'
  )
);

update public.products
set
  tiers = '[
    {"id":"plain","label":"Plain","price_cents":6000},
    {"id":"one_addon","label":"Chocolate chips, almonds, or peanuts","price_cents":6500},
    {"id":"chips_plus_nut","label":"Chocolate chips + 1 choice of nuts","price_cents":7000}
  ]'::jsonb
where slug = 'classic-banana-loaf';

update public.products set price_cents = 7000 where slug = 'oreo-banana-loaf';
update public.products set price_cents = 7500 where slug = 'nutty-nutella-banana-loaf';

update public.products
set
  tiers = '[
    {"id":"plain","label":"Plain","price_cents":7000},
    {"id":"one_addon","label":"Chocolate chips, almonds, or peanuts","price_cents":7500},
    {"id":"chips_plus_nut","label":"Chocolate chips + 1 choice of nuts","price_cents":8000}
  ]'::jsonb
where slug = 'mega-moist-double-chocolate';
