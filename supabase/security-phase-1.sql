-- RumoAoPro security hardening for an existing Supabase project.
-- Review in a preview project first, then run once in the production SQL Editor.
-- This migration is intentionally server-only: the website uses service_role.

begin;

-- Protect every present and future application table in the exposed schema.
-- Auth and Storage live in separate schemas and are not affected by this block.
do $$
declare
  protected_table record;
begin
  for protected_table in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I enable row level security',
      protected_table.schemaname,
      protected_table.tablename
    );
  end loop;
end
$$;

-- Remove direct API access, including privileges inherited from PUBLIC.
revoke all privileges on all tables in schema public
  from public, anon, authenticated;
revoke all privileges on all sequences in schema public
  from public, anon, authenticated;
revoke execute on all functions in schema public
  from public, anon, authenticated;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public
  grant all on sequences to service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  grant execute on functions to service_role;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customer_login_tokens'
      and column_name = 'token'
  ) then
    comment on column public.customer_login_tokens.token is
      'SHA-256 hash of the one-time login token; legacy plaintext rows expire naturally.';
  end if;
end
$$;

commit;

-- Verification: every public table should report rowsecurity = true.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Verification: this query should return zero rows.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by grantee, table_name, privilege_type;
