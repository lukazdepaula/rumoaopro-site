-- REVIEW ONLY: additive migration for the LoadPro database. No messages are sent.
begin;
create table if not exists public.loadpro_communication_preferences (
  user_id uuid primary key references auth.users(id),
  annual_trial_offer boolean not null default false,
  locale text not null default 'pt' check(locale in ('pt','en')),
  terms_version text not null check(terms_version = 'loadpro-trial-offer-v1'),
  source text not null check(source = 'authenticated_settings'),
  version uuid not null default gen_random_uuid(),
  granted_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.loadpro_trial_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  access_id uuid not null references public.billing_access(id),
  trial_end timestamptz not null,
  kind text not null default 'trial-ending-v1' check(kind = 'trial-ending-v1'),
  state text not null default 'reserved' check(state in ('reserved','sent','suppressed','uncertain')),
  preference_version uuid not null,
  access_version timestamptz not null,
  payload_hash text not null check(payload_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique(user_id, trial_end, kind)
);
alter table public.loadpro_communication_preferences enable row level security;
alter table public.loadpro_trial_reminders enable row level security;
revoke all on public.loadpro_communication_preferences, public.loadpro_trial_reminders from anon, authenticated;
grant all on public.loadpro_communication_preferences, public.loadpro_trial_reminders to service_role;

create or replace function public.set_loadpro_trial_offer_preference(p_user_id uuid, p_enabled boolean, p_locale text, p_terms_version text)
returns public.loadpro_communication_preferences language plpgsql security definer set search_path=public as $$
declare result public.loadpro_communication_preferences;
begin
  if p_enabled is null or p_locale not in ('pt','en') or p_locale is null
    or p_terms_version is distinct from 'loadpro-trial-offer-v1' then raise exception 'INVALID_PREFERENCE'; end if;
  insert into loadpro_communication_preferences(user_id,annual_trial_offer,locale,terms_version,source,granted_at,revoked_at)
    values(p_user_id,p_enabled,p_locale,p_terms_version,'authenticated_settings',
      case when p_enabled then now() end,case when not p_enabled then now() end)
    on conflict(user_id) do update set annual_trial_offer=p_enabled,locale=p_locale,
      version=gen_random_uuid(),updated_at=now(),
      granted_at=case when p_enabled then now() else loadpro_communication_preferences.granted_at end,
      revoked_at=case when not p_enabled then now() else loadpro_communication_preferences.revoked_at end
    returning * into result;
  -- Withdrawal also invalidates drafts already prepared for this account.
  if not p_enabled then update loadpro_trial_reminders set state='suppressed'
    where user_id=p_user_id and state='reserved'; end if;
  return result;
end $$;

-- Only an internal preparer may call this after checking the live provider and
-- communication suppression. Atomic versions reject stale consent/access.
-- A reservation is never retried as another message, even after a lost response.
create or replace function public.reserve_loadpro_trial_reminder(
  p_access_id uuid, p_access_version timestamptz, p_preference_version uuid,
  p_trial_end timestamptz, p_payload_hash text)
returns uuid language plpgsql security definer set search_path=public as $$
declare a public.billing_access; p public.loadpro_communication_preferences;
  result uuid; start_at timestamptz; end_at timestamptz;
begin
  select * into a from billing_access where id=p_access_id for update;
  if not found or a.user_id is null then return null; end if;
  select * into p from loadpro_communication_preferences where user_id=a.user_id for update;
  if not found or not p.annual_trial_offer or p.version is distinct from p_preference_version
    or a.updated_at is distinct from p_access_version then return null; end if;
  if coalesce(a.status,'') not in ('active','trialing') or a.access_kind is distinct from 'subscription'
    or a.billing_provider is distinct from 'stripe' or a.currency is distinct from 'BRL'
    or a.provider_subscription_id is null or a.provider_customer_id is null
    or ((a.plan_code='loadpro_founders' and a.price_cents=4990)
      or (a.plan_code='loadpro_founders_50' and a.price_cents=6990)) is not true
    or a.metadata->>'provider_subscription_status' is distinct from 'trialing'
    or a.metadata->>'billing_interval' = 'year' or a.metadata->>'cancel_at_period_end' = 'true'
    or a.metadata ? 'annual_change'
    or exists(select 1 from loadpro_annual_changes where access_id=a.id and confirmed_at is not null)
    then return null; end if;
  begin
    start_at=case when jsonb_typeof(a.metadata->'trial_start')='number'
      then to_timestamp((a.metadata->>'trial_start')::double precision) else (a.metadata->>'trial_start')::timestamptz end;
    end_at=case when jsonb_typeof(a.metadata->'trial_end')='number'
      then to_timestamp((a.metadata->>'trial_end')::double precision) else (a.metadata->>'trial_end')::timestamptz end;
  exception when others then return null; end;
  if end_at is null or start_at is null or end_at is distinct from p_trial_end
    or end_at-start_at is distinct from interval '7 days' or start_at>now()
    or end_at<=now() or end_at>now()+interval '48 hours' then return null; end if;
  insert into loadpro_trial_reminders(user_id,access_id,trial_end,preference_version,access_version,payload_hash)
    values(a.user_id,a.id,end_at,p.version,a.updated_at,p_payload_hash)
    on conflict(user_id,trial_end,kind) do nothing returning id into result;
  return result;
end $$;
revoke all on function public.set_loadpro_trial_offer_preference(uuid,boolean,text,text) from public,anon,authenticated;
revoke all on function public.reserve_loadpro_trial_reminder(uuid,timestamptz,uuid,timestamptz,text) from public,anon,authenticated;
grant execute on function public.set_loadpro_trial_offer_preference(uuid,boolean,text,text) to service_role;
grant execute on function public.reserve_loadpro_trial_reminder(uuid,timestamptz,uuid,timestamptz,text) to service_role;
commit;
