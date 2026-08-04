create table if not exists public.admin_push_subscriptions (
  id text primary key,
  admin_email text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  platform text not null default 'unknown',
  user_agent text,
  active boolean not null default true,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_push_subscriptions_email
  on public.admin_push_subscriptions(admin_email);

create index if not exists idx_admin_push_subscriptions_active
  on public.admin_push_subscriptions(active);

alter table public.admin_push_subscriptions enable row level security;

-- Nenhuma policy publica: leitura e escrita acontecem somente no servidor
-- usando a service role, depois de validar a sessao administrativa.
