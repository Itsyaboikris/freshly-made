-- Status change audit trail, loaf/slice products, per-line toppings (jsonb).

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_by_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_events_order_id
  on public.order_status_events (order_id, created_at asc);

alter table public.order_status_events enable row level security;

alter table public.order_items
  add column if not exists topping_ids jsonb not null default '[]'::jsonb;

-- Loaf vs slice (same flavor slug, different unit)
alter table public.products
  add column if not exists unit_type text default 'loaf';

update public.products set unit_type = 'loaf' where unit_type is null;

alter table public.products
  drop constraint if exists products_unit_type_check;

alter table public.products
  add constraint products_unit_type_check check (unit_type in ('loaf', 'slice'));

-- Flatten legacy tiered rows to base (plain) price
update public.products
set pricing_model = 'fixed', price_cents = 6000, tiers = '[]'::jsonb
where slug = 'classic-banana-loaf' and unit_type = 'loaf';

update public.products
set pricing_model = 'fixed', price_cents = 7000, tiers = '[]'::jsonb
where slug = 'oreo-banana-loaf' and unit_type = 'loaf';

update public.products
set pricing_model = 'fixed', price_cents = 7500, tiers = '[]'::jsonb
where slug = 'nutty-nutella-banana-loaf' and unit_type = 'loaf';

update public.products
set pricing_model = 'fixed', price_cents = 7000, tiers = '[]'::jsonb
where slug = 'mega-moist-double-chocolate' and unit_type = 'loaf';

alter table public.products drop constraint if exists products_slug_key;

create unique index if not exists products_slug_unit_unique
  on public.products (slug, unit_type);

-- Slice variants (~half of loaf base; adjust in Supabase if needed)
insert into public.products (slug, unit_type, name, description, image_path, pricing_model, price_cents, tiers, sort_order)
select v.slug, v.unit_type, v.name, v.description, v.image_path, v.pricing_model, v.price_cents, v.tiers, v.sort_order
from (
  values
    ('classic-banana-loaf', 'slice', 'Classic Banana Bread (slice)', 'Super moist, soft and loaded with banana flavor — sliced portion.', null::text, 'fixed', 3000, '[]'::jsonb, 11),
    ('oreo-banana-loaf', 'slice', 'Oreo Banana Bread (slice)', 'Tender, moist, topped with vanilla cream Oreo — sliced portion.', null, 'fixed', 3500, '[]'::jsonb, 12),
    ('nutty-nutella-banana-loaf', 'slice', 'Nutty Nutella Banana Bread (slice)', 'Nutella, chopped peanuts — sliced portion.', null, 'fixed', 3750, '[]'::jsonb, 13),
    ('mega-moist-double-chocolate', 'slice', 'Mega Moist Double Chocolate (slice)', 'Chocolatey loaf with melted chips — sliced portion.', null, 'fixed', 3500, '[]'::jsonb, 14)
) as v(slug, unit_type, name, description, image_path, pricing_model, price_cents, tiers, sort_order)
where not exists (
  select 1 from public.products p
  where p.slug = v.slug and p.unit_type = v.unit_type
);

alter table public.products alter column unit_type set not null;

-- Backfill one event per existing order (created in current status — no prior history)
insert into public.order_status_events (order_id, previous_status, new_status, changed_by_email, created_at)
select id, null, status, null, created_at
from public.orders o
where not exists (
  select 1 from public.order_status_events e where e.order_id = o.id
);
