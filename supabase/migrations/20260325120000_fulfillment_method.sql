-- Pickup vs delivery fulfillment on orders.
-- Run in Supabase SQL editor if orders fail with:
--   Could not find the 'fulfillment_method' column of 'orders' in the schema cache

alter table public.orders
  add column if not exists fulfillment_method text;

update public.orders
set fulfillment_method = 'pickup'
where fulfillment_method is null;

alter table public.orders
  alter column fulfillment_method set default 'pickup';

alter table public.orders
  alter column fulfillment_method set not null;

alter table public.orders
  drop constraint if exists orders_fulfillment_method_check;

alter table public.orders
  add constraint orders_fulfillment_method_check
  check (fulfillment_method in ('pickup', 'delivery'));

-- Counter pickup does not need a scheduled date; delivery still requires one at checkout.
alter table public.orders
  alter column preferred_date drop not null;
