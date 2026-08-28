-- Pickup vs delivery fulfillment on orders.
-- Run after prior migrations.

alter table public.orders
  add column if not exists fulfillment_method text not null default 'pickup'
  check (fulfillment_method in ('pickup', 'delivery'));

-- Counter pickup does not need a scheduled date.
alter table public.orders alter column preferred_date drop not null;
