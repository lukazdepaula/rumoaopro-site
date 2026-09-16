-- REVIEW ONLY: apply after loadpro-annual-reminders.sql in the LoadPro database.
-- Additive ledger fields. Installation never sends, changes consent or billing.
begin;
alter table public.loadpro_trial_reminders add column if not exists delivery_payload jsonb;
alter table public.loadpro_trial_reminders add column if not exists send_started_at timestamptz;
alter table public.loadpro_trial_reminders add column if not exists provider_email_id uuid;
alter table public.loadpro_trial_reminders add column if not exists provider_event text;
alter table public.loadpro_trial_reminders add column if not exists delivery_updated_at timestamptz;
create unique index if not exists loadpro_reminder_email_once on public.loadpro_trial_reminders(provider_email_id)
  where provider_email_id is not null;

create or replace function public.claim_loadpro_reminder_delivery(
  p_id uuid,p_access_version timestamptz,p_preference_version uuid,p_payload_hash text,p_payload jsonb,p_checked_at timestamptz)
returns public.loadpro_trial_reminders language plpgsql security definer set search_path=public as $$
declare r public.loadpro_trial_reminders; a public.billing_access; p public.loadpro_communication_preferences;
  start_at timestamptz; end_at timestamptz;
begin
  select * into r from loadpro_trial_reminders where id=p_id;
  if not found then return null; end if;
  -- Match reservation/annual confirmation lock order: access, preference, reminder.
  select * into a from billing_access where id=r.access_id for update;
  select * into p from loadpro_communication_preferences where user_id=r.user_id for update;
  select * into r from loadpro_trial_reminders where id=p_id for update;
  if r.state is distinct from 'reserved' or r.send_started_at is not null
    or a.user_id is distinct from r.user_id or p.user_id is distinct from r.user_id
    or p.annual_trial_offer is not true or p.terms_version is distinct from 'loadpro-trial-offer-v1'
    or p.version is distinct from p_preference_version or p.version is distinct from r.preference_version
    or a.updated_at is distinct from p_access_version or a.updated_at is distinct from r.access_version
    or r.payload_hash is distinct from p_payload_hash
    or p_checked_at is null or p_checked_at>clock_timestamp() or p_checked_at<clock_timestamp()-interval '60 seconds'
    then return null; end if;
  if coalesce(a.status,'') not in ('active','trialing') or a.access_kind is distinct from 'subscription'
    or a.billing_provider is distinct from 'stripe' or a.currency is distinct from 'BRL'
    or a.provider_subscription_id is null or a.provider_customer_id is null
    or ((a.plan_code='loadpro_founders' and a.price_cents=4990)
      or (a.plan_code='loadpro_founders_50' and a.price_cents=6990)) is not true
    or a.metadata->>'provider_subscription_status' is distinct from 'trialing'
    or a.metadata->>'billing_interval'='year' or a.metadata->>'cancel_at_period_end'='true' or a.metadata ? 'annual_change'
    or exists(select 1 from loadpro_annual_changes where access_id=a.id and confirmed_at is not null)
    then return null; end if;
  begin
    start_at=case when jsonb_typeof(a.metadata->'trial_start')='number'
      then to_timestamp((a.metadata->>'trial_start')::double precision) else (a.metadata->>'trial_start')::timestamptz end;
    end_at=case when jsonb_typeof(a.metadata->'trial_end')='number'
      then to_timestamp((a.metadata->>'trial_end')::double precision) else (a.metadata->>'trial_end')::timestamptz end;
  exception when others then return null; end;
  if end_at is null or start_at is null or end_at is distinct from r.trial_end
    or end_at-start_at is distinct from interval '7 days' or start_at>now()
    or end_at<=now() or end_at>now()+interval '48 hours' then return null; end if;
  if jsonb_typeof(p_payload) is distinct from 'object'
    or p_payload->'to' is distinct from jsonb_build_array(a.email)
    or coalesce(p_payload->>'from','')='' or coalesce(p_payload->>'subject','')='' or coalesce(p_payload->>'text','')=''
    or p_payload->'tags' is distinct from jsonb_build_array(
      jsonb_build_object('name','loadpro_reminder','value',r.id::text),jsonb_build_object('name','payload_hash','value',r.payload_hash))
    or (p_payload - array['from','to','subject','text','tags']) <> '{}'::jsonb then raise exception 'INVALID_REMINDER_PAYLOAD'; end if;
  update loadpro_trial_reminders set state='uncertain',delivery_payload=p_payload,send_started_at=clock_timestamp(),
    delivery_updated_at=clock_timestamp() where id=r.id returning * into r;
  return r;
end $$;

create or replace function public.record_loadpro_reminder_delivery(p_id uuid,p_email_id uuid,p_event text)
returns public.loadpro_trial_reminders language plpgsql security definer set search_path=public as $$
declare r public.loadpro_trial_reminders;
begin
  select * into strict r from loadpro_trial_reminders where id=p_id for update;
  if r.send_started_at is null or r.delivery_payload is null or p_email_id is null
    or p_event is null or p_event not in ('accepted','sent','delivered','delivery_delayed','opened','clicked','bounced','complained','failed','suppressed')
    or (r.provider_email_id is not null and r.provider_email_id<>p_email_id) then raise exception 'INVALID_REMINDER_PROOF'; end if;
  -- Late acceptance cannot erase a known bounce/complaint/suppression.
  if r.provider_event in ('bounced','complained','failed','suppressed') then return r; end if;
  update loadpro_trial_reminders set provider_email_id=p_email_id,provider_event=p_event,
    state=case when p_event in ('bounced','complained','failed','suppressed') then 'suppressed' else 'sent' end,
    delivery_updated_at=clock_timestamp() where id=r.id returning * into r;
  return r;
end $$;
revoke all on function public.claim_loadpro_reminder_delivery(uuid,timestamptz,uuid,text,jsonb,timestamptz),
  public.record_loadpro_reminder_delivery(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.claim_loadpro_reminder_delivery(uuid,timestamptz,uuid,text,jsonb,timestamptz),
  public.record_loadpro_reminder_delivery(uuid,uuid,text) to service_role;
commit;
