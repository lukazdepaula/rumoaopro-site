-- RumoAoPro phase 2: encrypted TOTP MFA and one-use recovery codes for admins.
-- Run in Preview first. The migration is additive and transactional.

begin;

alter table public.admin_accounts
  add column if not exists mfa_secret_encrypted text,
  add column if not exists mfa_enabled_at timestamptz,
  add column if not exists mfa_updated_at timestamptz,
  add column if not exists mfa_last_used_step bigint;

create table if not exists public.admin_mfa_recovery_codes (
  id text primary key,
  email text not null references public.admin_accounts(email) on delete cascade,
  code_hash text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_mfa_recovery_codes_email
  on public.admin_mfa_recovery_codes(email);
create index if not exists idx_admin_mfa_recovery_codes_active
  on public.admin_mfa_recovery_codes(email, used_at);

alter table public.admin_accounts enable row level security;
alter table public.admin_mfa_recovery_codes enable row level security;

revoke all privileges on table public.admin_mfa_recovery_codes
  from public, anon, authenticated;
grant all privileges on table public.admin_mfa_recovery_codes
  to service_role;

comment on column public.admin_accounts.mfa_secret_encrypted is
  'AES-256-GCM encrypted RFC 6238 TOTP secret. Never exposed to browser APIs.';
comment on column public.admin_accounts.mfa_last_used_step is
  'Last accepted TOTP time step, used to reject replay.';
comment on column public.admin_mfa_recovery_codes.code_hash is
  'HMAC-SHA-256 hash of a one-use recovery code.';

commit;

select
  count(*) filter (where rowsecurity) as protected_tables,
  count(*) as public_tables
from pg_tables
where schemaname = 'public';

select count(*) as exposed_mfa_grants
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'admin_mfa_recovery_codes'
  and grantee in ('PUBLIC', 'anon', 'authenticated');
