-- RAPTOR database only. Apply after its migration 012, first in isolated QA.
-- Checkout must use this RPC before enabling STRIPE_RETRY_SAFE_FULFILLMENT_ENABLED.
-- No existing access or customer rows are rewritten by this migration.
begin;
create table if not exists public.commercial_program_order_access (
  order_id text primary key,
  program_id text not null,
  email text not null,
  status text not null check (status in ('granted','revoked')),
  updated_at timestamptz not null default now()
);
alter table public.commercial_program_order_access enable row level security;
revoke all on public.commercial_program_order_access from public, anon, authenticated;
create index if not exists commercial_program_order_access_customer
  on public.commercial_program_order_access(program_id,email,status);

create or replace function public.set_commercial_program_paid_access_safe(
  p_program_id text, p_email text, p_status text, p_order_id text,
  p_preserve_order_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  normalized_email text := lower(trim(coalesce(p_email,'')));
  previous public.commercial_program_order_access;
  retained text;
begin
  if p_order_id is null or p_order_id = '' or length(p_order_id)>200
    or normalized_email = '' or p_program_id is null or p_status is null
    or p_status not in ('granted','revoked') then
    raise exception 'Invalid paid access request';
  end if;
  -- Serialize even distinct orders for the same customer/program. A transaction
  -- that arrives late can never overwrite the terminal revocation of its order.
  perform pg_advisory_xact_lock(hashtextextended(p_program_id || ':' || normalized_email,0));
  select * into previous from public.commercial_program_order_access where order_id=p_order_id for update;
  if found and (previous.program_id<>p_program_id or previous.email<>normalized_email) then
    raise exception 'Order identity mismatch';
  end if;
  if previous.status='revoked' and p_status='granted' then
    raise exception 'Closed order cannot grant access';
  end if;
  insert into public.commercial_program_order_access(order_id,program_id,email,status)
    values(p_order_id,p_program_id,normalized_email,p_status)
    on conflict(order_id) do update set status=excluded.status,updated_at=now()
      where public.commercial_program_order_access.program_id=excluded.program_id
        and public.commercial_program_order_access.email=excluded.email;
  if not found then raise exception 'Order identity mismatch'; end if;

  -- The checkout may identify a valid historical purchase not yet in this ledger.
  -- Never resurrect it if a concurrent refund has already recorded a tombstone.
  if p_status='revoked' and p_preserve_order_id is not null and p_preserve_order_id<>p_order_id then
    insert into public.commercial_program_order_access(order_id,program_id,email,status)
      values(p_preserve_order_id,p_program_id,normalized_email,'granted') on conflict do nothing;
  end if;
  select order_id into retained from public.commercial_program_order_access
    where program_id=p_program_id and email=normalized_email and status='granted'
    order by updated_at desc,order_id limit 1;
  if p_status='revoked' and not exists(select 1 from auth.users where lower(email)=normalized_email) then
    -- Preserve revocation even if the invitation/user creation has not finished.
    return jsonb_build_object('status','revoked','orderId',p_order_id);
  end if;
  return public.set_commercial_program_paid_access(p_program_id,normalized_email,
    case when retained is null then 'revoked' else 'granted' end, coalesce(retained,p_order_id));
end;
$$;
revoke all on function public.set_commercial_program_paid_access_safe(text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.set_commercial_program_paid_access_safe(text,text,text,text,text) to service_role;
commit;
