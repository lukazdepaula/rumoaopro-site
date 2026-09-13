-- REVIEW ONLY. Apply to the LoadPro Supabase project, never the site database.
-- Additive; no existing subscription or athlete data is changed by installation.
begin;
create table if not exists public.loadpro_annual_changes (
  id uuid primary key default gen_random_uuid(),
  access_id uuid not null references public.billing_access(id),
  user_id uuid not null references auth.users(id),
  state text not null default 'quoted' check (state in ('quoted','processing','awaiting_payment','scheduled','paid','failed')),
  method text not null check (method in ('card','pix')),
  access_version timestamptz not null,
  quote jsonb not null,
  provider jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((quote->>'price_cents')::integer = 49900 and quote->>'currency' = 'BRL')
);
create unique index if not exists loadpro_annual_one_pending on public.loadpro_annual_changes(access_id)
  where state in ('processing','awaiting_payment','scheduled');
create unique index if not exists loadpro_annual_payment_once on public.loadpro_annual_changes((provider->>'payment_id'))
  where provider->>'payment_id' is not null;
alter table public.loadpro_annual_changes enable row level security;
revoke all on public.loadpro_annual_changes from anon, authenticated;
grant all on public.loadpro_annual_changes to service_role;

create table if not exists public.loadpro_billing_mutations (
  access_id uuid primary key references public.billing_access(id),
  operation_id uuid not null unique,
  created_at timestamptz not null default now()
);
alter table public.loadpro_billing_mutations enable row level security;
revoke all on public.loadpro_billing_mutations from anon, authenticated;
grant all on public.loadpro_billing_mutations to service_role;

create or replace function public.lock_loadpro_billing(p_access_id uuid, p_operation_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.loadpro_billing_mutations(access_id,operation_id) values(p_access_id,p_operation_id)
    on conflict(access_id) do nothing;
  if not exists(select 1 from public.loadpro_billing_mutations where access_id=p_access_id and operation_id=p_operation_id)
    then raise exception 'BILLING_BUSY'; end if;
end $$;
create or replace function public.unlock_loadpro_billing(p_operation_id uuid)
returns void language sql security definer set search_path=public as $$
  delete from public.loadpro_billing_mutations where operation_id=p_operation_id;
$$;

create or replace function public.confirm_loadpro_annual(p_id uuid, p_user_id uuid)
returns public.loadpro_annual_changes language plpgsql security definer set search_path=public as $$
declare c public.loadpro_annual_changes; a public.billing_access;
begin
  select * into strict c from public.loadpro_annual_changes where id=p_id and user_id=p_user_id for update;
  select * into strict a from public.billing_access where id=c.access_id and user_id=p_user_id for update;
  if c.state <> 'quoted' then return c; end if;
  if c.expires_at <= now() or a.updated_at <> c.access_version then raise exception 'QUOTE_CHANGED'; end if;
  if a.plan_code <> 'loadpro_founders' or a.currency <> 'BRL' or a.access_kind = 'lifetime' then raise exception 'INELIGIBLE'; end if;
  if not (a.price_cents=49900 and a.metadata->>'billing_interval'='year' and a.metadata->>'payment_method'='pix' and c.method='pix') then
    if a.price_cents<>4990 or a.metadata ? 'annual_change' then raise exception 'INELIGIBLE'; end if;
  end if;
  perform public.lock_loadpro_billing(a.id,c.id);
  update public.loadpro_annual_changes set state='processing',confirmed_at=now(),updated_at=now() where id=c.id returning * into c;
  update public.billing_access set metadata=metadata || jsonb_build_object('annual_change',
    c.quote || jsonb_build_object('id',c.id,'state',c.state)),updated_at=now() where id=a.id;
  return c;
end $$;

create or replace function public.finish_loadpro_annual(p_id uuid, p_state text, p_provider jsonb)
returns public.loadpro_annual_changes language plpgsql security definer set search_path=public as $$
declare c public.loadpro_annual_changes; a public.billing_access; annual_start timestamptz; annual_end timestamptz;
begin
  select * into strict c from public.loadpro_annual_changes where id=p_id for update;
  select * into strict a from public.billing_access where id=c.access_id for update;
  if c.state='paid' then return c; end if;
  if c.confirmed_at is null or p_state not in ('awaiting_payment','scheduled','paid','failed') then raise exception 'INVALID_STATE'; end if;
  if p_state='paid' and (c.method<>'pix' or p_provider->>'verified' is distinct from 'true' or p_provider->>'payment_id' is null
    or p_provider->>'amount_cents' is distinct from '49900' or p_provider->>'currency' is distinct from 'BRL' or p_provider->>'approved_at' is null
    or (c.provider->>'payment_id' is not null and c.provider->>'payment_id' is distinct from p_provider->>'payment_id')) then raise exception 'PAYMENT_NOT_VERIFIED'; end if;
  if c.state not in ('processing','awaiting_payment','failed') then raise exception 'INVALID_TRANSITION'; end if;
  if c.method='card' and p_state<>'scheduled' then raise exception 'INVALID_CARD_STATE'; end if;
  if a.access_kind='lifetime' or a.plan_code<>'loadpro_founders' then raise exception 'ACCESS_CHANGED'; end if;
  update public.loadpro_annual_changes set state=p_state,provider=provider || p_provider,updated_at=now() where id=c.id returning * into c;
  if p_state='paid' then
    -- Approval time comes from the provider, never the return URL or browser clock.
    annual_start=greatest((c.quote->>'effective_at')::timestamptz,a.current_period_end,(p_provider->>'approved_at')::timestamptz);
    annual_end=((annual_start at time zone 'UTC') + interval '1 year') at time zone 'UTC';
    update public.billing_access set status='active',price_cents=49900,currency='BRL',
      current_period_end=annual_end,billing_provider='mercado_pago',provider_subscription_id='pix:' || (c.provider->>'payment_id'),
      metadata=metadata || jsonb_build_object('billing_interval','year','payment_method','pix','renewal_mode','manual',
        'provider_subscription_status','active','cancel_at_period_end',false,
        'annual_change',c.quote || jsonb_build_object('id',c.id,'state','paid','effective_at',annual_start,'access_until',annual_end)),
      updated_at=now() where id=a.id;
  else
    update public.billing_access set metadata=metadata || jsonb_build_object('annual_change',
      c.quote || jsonb_build_object('id',c.id,'state',p_state),
      'cancel_at_period_end',case when c.method='pix' then true else coalesce((metadata->>'cancel_at_period_end')::boolean,false) end),
      updated_at=now() where id=a.id;
  end if;
  perform public.unlock_loadpro_billing(c.id);
  return c;
end $$;
revoke all on function public.lock_loadpro_billing(uuid,uuid),public.unlock_loadpro_billing(uuid),
  public.confirm_loadpro_annual(uuid,uuid),public.finish_loadpro_annual(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.lock_loadpro_billing(uuid,uuid),public.unlock_loadpro_billing(uuid),
  public.confirm_loadpro_annual(uuid,uuid),public.finish_loadpro_annual(uuid,text,jsonb) to service_role;
commit;
