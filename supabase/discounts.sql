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
