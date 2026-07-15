create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  language text not null default 'English',
  type text not null,
  base_price_usd numeric(10, 2) not null default 40,
  price_brl_estimated numeric(10, 2) not null default 0,
  price_brl numeric(10, 2) not null,
  price_usd numeric(10, 2) not null,
  active boolean not null default true,
  sales_page_path text not null default '',
  cover_image text not null default '',
  delivery_type text not null,
  file_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  product_id text not null references public.products(id),
  product_name text not null,
  user_id text references public.users(id),
  customer_name text not null,
  customer_email text not null,
  customer_country text not null,
  customer_document_type text,
  customer_document text,
  gateway text not null,
  gateway_payment_id text,
  gateway_checkout_id text,
  amount numeric(10, 2) not null,
  currency text not null,
  exchange_rate_used numeric(10, 4),
  status text not null,
  delivery_status text not null,
  fiscal_status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_gateway on public.orders(gateway);
create index if not exists idx_orders_country on public.orders(customer_country);
create index if not exists idx_orders_product on public.orders(product_id);
create index if not exists idx_orders_payment on public.orders(gateway_payment_id);
create index if not exists idx_orders_checkout on public.orders(gateway_checkout_id);
create index if not exists idx_orders_user on public.orders(user_id);

create table if not exists public.discounts (
  id text primary key,
  code text not null unique,
  description text not null default '',
  type text not null check (type in ('percent', 'fixed')),
  value numeric(10, 2) not null,
  currency text,
  product_id text references public.products(id),
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  max_redemptions integer,
  times_redeemed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_discounts_code on public.discounts(code);
create index if not exists idx_discounts_active on public.discounts(active);

create table if not exists public.customer_login_tokens (
  id text primary key,
  user_id text not null references public.users(id),
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_login_tokens_token
  on public.customer_login_tokens(token);

create table if not exists public.entitlements (
  id text primary key,
  user_id text not null references public.users(id),
  order_id text references public.orders(id),
  product_id text not null references public.products(id),
  access_status text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, product_id)
);

create index if not exists idx_entitlements_user on public.entitlements(user_id);
create index if not exists idx_entitlements_product on public.entitlements(product_id);
create index if not exists idx_entitlements_status on public.entitlements(access_status);

create table if not exists public.program_materials (
  id text primary key,
  product_id text not null references public.products(id),
  title text not null,
  description text not null,
  type text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  file_path_private text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_program_materials_product
  on public.program_materials(product_id);

create table if not exists public.webhook_events (
  id text primary key,
  provider text not null,
  event_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

create table if not exists public.order_logs (
  id text primary key,
  order_id text not null references public.orders(id),
  type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_logs_order on public.order_logs(order_id);

insert into public.products (
  id, name, slug, description, language, type, base_price_usd,
  price_brl_estimated, price_brl, price_usd, active, sales_page_path,
  cover_image, delivery_type, file_id, created_at, updated_at
) values
  (
    'offseason_30_days',
    'Offseason 30 Days',
    'offseason-30-days',
    'Programa de 30 dias para organizar campo, academia, velocidade e condicionamento em uma offseason curta.',
    'English',
    'training_program',
    40,
    220,
    220,
    40,
    true,
    '/programas/offseason-30-days',
    '/assets/programs/offseason-30/offseason-30-preview-01.jpg',
    'member_area',
    'offseason-30-days.pdf',
    now(),
    now()
  ),
  (
    'adama_strength_power',
    'Adama Offseason Strength and Power',
    'adama-offseason-strength-and-power',
    'Programa de 12 semanas para construir força, potência e presença física na offseason.',
    'English',
    'training_program',
    40,
    220,
    220,
    40,
    true,
    '/programas/adama-strength-power',
    '/assets/programs/adama/adama-cover.webp',
    'member_area',
    'adama-strength-power.pdf',
    now(),
    now()
  ),
  (
    'project_36',
    'Project 36',
    'project-36',
    'Sistema de 12 semanas para aceleração, top speed, re-aceleração e velocidade de jogo.',
    'English',
    'training_program',
    40,
    220,
    220,
    40,
    true,
    '/programas/projeto-36kmh',
    '/assets/programs/project-36/project-36-cover.jpg',
    'member_area',
    'projeto-36kmh-speed-acceleration.zip',
    now(),
    now()
  ),
  (
    'elanga_in_season',
    'Elanga In Season',
    'elanga-in-season',
    'Programa in-season para manter força, velocidade e disponibilidade durante a temporada.',
    'English',
    'training_program',
    40,
    220,
    220,
    40,
    true,
    '/programas/elanga-in-season',
    '/assets/programs/elanga/elanga-cover.jpg',
    'member_area',
    'elanga-in-season.zip',
    now(),
    now()
  )
on conflict(id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  language = excluded.language,
  type = excluded.type,
  base_price_usd = excluded.base_price_usd,
  price_brl_estimated = excluded.price_brl_estimated,
  price_brl = excluded.price_brl,
  price_usd = excluded.price_usd,
  active = excluded.active,
  sales_page_path = excluded.sales_page_path,
  cover_image = excluded.cover_image,
  delivery_type = excluded.delivery_type,
  file_id = excluded.file_id,
  updated_at = now();

insert into public.discounts (
  id, code, description, type, value, currency, product_id, active,
  starts_at, expires_at, max_redemptions, times_redeemed, created_at, updated_at
) values (
  'discount_assistente90',
  'ASSISTENTE90',
  'Teste interno para validar compra com 90% de desconto.',
  'percent',
  90,
  null,
  null,
  true,
  null,
  null,
  null,
  0,
  now(),
  now()
)
on conflict(id) do nothing;

insert into public.program_materials (
  id, product_id, title, description, type, sort_order, is_active,
  file_path_private, external_url, created_at, updated_at
)
select
  products.id || '_overview',
  products.id,
  'Program overview',
  'Start here. This section explains the goal, structure and how to follow the program.',
  'text',
  1,
  true,
  null,
  null,
  now(),
  now()
from public.products
on conflict(id) do update set
  product_id = excluded.product_id,
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.program_materials (
  id, product_id, title, description, type, sort_order, is_active,
  file_path_private, external_url, created_at, updated_at
)
select
  products.id || '_main_material',
  products.id,
  'Training material',
  'Private program file placeholder. The real PDF or file will be connected through private storage.',
  'pdf',
  2,
  true,
  products.file_id,
  null,
  now(),
  now()
from public.products
on conflict(id) do update set
  product_id = excluded.product_id,
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  file_path_private = excluded.file_path_private,
  updated_at = now();

insert into public.program_materials (
  id, product_id, title, description, type, sort_order, is_active,
  file_path_private, external_url, created_at, updated_at
)
select
  products.id || '_support',
  products.id,
  'Support notes',
  'Coach notes, progression reminders and future video links for this program.',
  'text',
  3,
  true,
  null,
  null,
  now(),
  now()
from public.products
on conflict(id) do update set
  product_id = excluded.product_id,
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();
