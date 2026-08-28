-- Freshly Baked Banana Bread — schema
-- Run in Supabase SQL editor or via supabase db push

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  unit_type text not null default 'loaf' check (unit_type in ('loaf', 'slice')),
  name text not null,
  description text not null,
  image_path text,
  pricing_model text not null check (pricing_model in ('fixed', 'tiered')),
  price_cents int not null,
  tiers jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  active boolean not null default true,
  unique (slug, unit_type)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text,
  customer_phone text not null,
  preferred_date date not null,
  pickup_location_id text not null,
  pickup_slot_summary text not null,
  notes text,
  customer_name text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  total_cents int not null check (total_cents >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity int not null default 1 check (quantity > 0),
  tier_id text,
  topping_ids jsonb not null default '[]'::jsonb,
  selection_label text not null,
  unit_price_cents int not null check (unit_price_cents >= 0),
  line_total_cents int not null check (line_total_cents >= 0)
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Anonymous visitors can read active products (menu).
create policy "products_public_read"
  on public.products
  for select
  to anon, authenticated
  using (active = true);

-- Orders are written only from the server (secret key / API route). No anon policies on orders/order_items.

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

insert into public.products (slug, unit_type, name, description, image_path, pricing_model, price_cents, tiers, sort_order)
values
  (
    'classic-banana-loaf',
    'loaf',
    'Classic Banana Loaf (2 lb loaf)',
    'Super moist, soft and loaded with banana flavor. Add chocolate chips, sliced almonds, and/or peanuts for $5 each.',
    null,
    'fixed',
    6000,
    '[]'::jsonb,
    1
  ),
  (
    'oreo-banana-loaf',
    'loaf',
    'Oreo Banana Loaf (2 lb loaf)',
    'Tender, moist, topped with vanilla cream Oreo. ',
    null,
    'fixed',
    7000,
    '[]'::jsonb,
    2
  ),
  (
    'nutty-nutella-banana-loaf',
    'loaf',
    'Nutty Nutella Banana Loaf (2 lb loaf)',
    'Nutella and peanuts. ',
    null,
    'fixed',
    7500,
    '[]'::jsonb,
    3
  ),
  (
    'mega-moist-double-chocolate',
    'loaf',
    'Mega Moist Double Chocolate Loaf (2 lb)',
    'Chocolatey with melted chips. ',
    null,
    'fixed',
    7000,
    '[]'::jsonb,
    4
  ),
  (
    'classic-banana-loaf',
    'slice',
    'Classic Banana Bread (slice)',
    'Sliced portion. Add chocolate chips, sliced almonds, and/or peanuts for $5 each.',
    null,
    'fixed',
    3000,
    '[]'::jsonb,
    11
  ),
  (
    'oreo-banana-loaf',
    'slice',
    'Oreo Banana Bread (slice)',
    'Sliced portion. ',
    null,
    'fixed',
    3500,
    '[]'::jsonb,
    12
  ),
  (
    'nutty-nutella-banana-loaf',
    'slice',
    'Nutty Nutella Banana Bread (slice)',
    'Sliced portion. ',
    null,
    'fixed',
    3750,
    '[]'::jsonb,
    13
  ),
  (
    'mega-moist-double-chocolate',
    'slice',
    'Mega Moist Double Chocolate (slice)',
    'Sliced portion. ',
    null,
    'fixed',
    3500,
    '[]'::jsonb,
    14
  )
on conflict (slug, unit_type) do nothing;
