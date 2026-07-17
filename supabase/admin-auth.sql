create table if not exists public.admin_accounts (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  active boolean not null default true,
  password_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_accounts_email
  on public.admin_accounts(email);

create table if not exists public.admin_password_reset_tokens (
  id text primary key,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_password_reset_tokens_hash
  on public.admin_password_reset_tokens(token_hash);
create index if not exists idx_admin_password_reset_tokens_email
  on public.admin_password_reset_tokens(email);

alter table public.admin_accounts enable row level security;
alter table public.admin_password_reset_tokens enable row level security;
