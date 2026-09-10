-- Run in the LOADPRO project, not the central checkout project.
-- Additive, server-only guard. Does not modify coaches, players or billing access.
begin;
create table if not exists public.loadpro_checkout_reservations (
  email text primary key check (email = lower(trim(email))),
  reservation_id uuid not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.loadpro_checkout_reservations enable row level security;
revoke all on public.loadpro_checkout_reservations from public, anon, authenticated;

create or replace function public.reserve_loadpro_checkout(p_email text, p_reservation_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email));
  v_access public.billing_access;
  v_reserved uuid;
  v_expires timestamptz := now() + interval '40 minutes';
begin
  if v_email = '' or p_reservation_id is null then raise exception 'Invalid checkout reservation'; end if;
  -- Serializes requests even when there is no billing_access row yet.
  perform pg_advisory_xact_lock(hashtextextended('loadpro-checkout:' || v_email, 0));
  select * into v_access from public.billing_access where email = v_email;
  if found and (v_access.access_kind = 'lifetime' or
    (v_access.provider_subscription_id is not null and v_access.status not in ('canceled','cancelled','incomplete_expired'))) then
    return jsonb_build_object('allowed', false, 'reason', 'existing_subscription');
  end if;
  insert into public.loadpro_checkout_reservations(email,reservation_id,expires_at)
  values(v_email,p_reservation_id,v_expires)
  on conflict(email) do update set reservation_id=excluded.reservation_id,
    expires_at=excluded.expires_at, updated_at=now()
  where public.loadpro_checkout_reservations.expires_at <= now()
  returning reservation_id into v_reserved;
  if v_reserved is null then
    return jsonb_build_object('allowed',false,'reason','checkout_in_progress');
  end if;
  -- Existing customers never receive another free trial, even after cancellation.
  return jsonb_build_object('allowed',true,'trial_eligible',v_access.id is null,
    'expires_at',floor(extract(epoch from v_expires - interval '5 minutes')));
end;
$$;
revoke all on function public.reserve_loadpro_checkout(text,uuid) from public, anon, authenticated;
grant execute on function public.reserve_loadpro_checkout(text,uuid) to service_role;
commit;
