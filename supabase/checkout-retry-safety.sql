-- PREPARATION ONLY. Apply to the isolated CHECKOUT database first, never the apps.
-- Additive migration; no orders, entitlements or historical webhook rows are changed.
begin;
create table if not exists public.checkout_retry_work (
  work_key text primary key,
  state text not null check (state in ('processing','completed','failed')),
  token uuid,
  lease_until timestamptz,
  attempts integer not null default 0
);
create table if not exists public.checkout_retry_email (
  email_key text primary key,
  encrypted_payload text,
  first_attempt_at timestamptz,
  sent_at timestamptz
);
alter table public.checkout_retry_work enable row level security;
alter table public.checkout_retry_email enable row level security;
revoke all on public.checkout_retry_work, public.checkout_retry_email from public, anon, authenticated;

create or replace function public.checkout_retry_operation(
  p_operation text, p_key text, p_token uuid default null,
  p_payload text default null, p_legacy_event_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  w public.checkout_retry_work;
  e public.checkout_retry_email;
begin
  if p_key is null or length(p_key) > 256 or p_key !~ '^(stripe-event|raptor-order|raptor-welcome):[a-zA-Z0-9_-]+$' then
    raise exception 'Invalid retry key';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_key, 0));
  if p_operation = 'claim' then
    if p_token is null then raise exception 'Missing claim token'; end if;
    select * into w from public.checkout_retry_work where work_key = p_key;
    -- Legacy rows have unknown fulfillment state. Never automatically replay old purchases.
    if not found and p_legacy_event_id is not null then
      if p_key <> 'stripe-event:' || p_legacy_event_id then raise exception 'Invalid legacy key'; end if;
      if exists (select 1 from public.webhook_events where provider='stripe' and event_id=p_legacy_event_id) then
        insert into public.checkout_retry_work(work_key,state) values(p_key,'completed');
        return jsonb_build_object('state','completed');
      end if;
    end if;
    if w.state = 'completed' then return jsonb_build_object('state','completed'); end if;
    if w.state = 'processing' and w.lease_until > clock_timestamp() then
      return jsonb_build_object('state','busy');
    end if;
    insert into public.checkout_retry_work(work_key,state,token,lease_until,attempts)
    values(p_key,'processing',p_token,clock_timestamp()+interval '5 minutes',1)
    on conflict(work_key) do update set state='processing',token=excluded.token,
      lease_until=excluded.lease_until,attempts=public.checkout_retry_work.attempts+1;
    return jsonb_build_object('state','claimed','token',p_token);
  elsif p_operation in ('complete','release') then
    update public.checkout_retry_work set state=case when p_operation='complete' then 'completed' else 'failed' end,
      token=null,lease_until=null where work_key=p_key and state='processing'
      and token=p_token and lease_until > clock_timestamp();
    return jsonb_build_object('updated',found);
  elsif p_operation in ('get_email','prepare_email','start_email','sent_email') then
    if p_key not like 'raptor-welcome:%' then raise exception 'Invalid email key'; end if;
    if p_operation='prepare_email' then
      if p_payload is null or length(p_payload)>100000 then raise exception 'Invalid encrypted payload'; end if;
      insert into public.checkout_retry_email(email_key,encrypted_payload) values(p_key,p_payload)
      on conflict(email_key) do nothing;
    elsif p_operation='start_email' then
      update public.checkout_retry_email set first_attempt_at=coalesce(first_attempt_at,clock_timestamp()) where email_key=p_key;
    elsif p_operation='sent_email' then
      -- Erase the encrypted personal link once the durable sent marker is written.
      update public.checkout_retry_email set sent_at=coalesce(sent_at,clock_timestamp()),encrypted_payload=null where email_key=p_key;
    end if;
    select * into e from public.checkout_retry_email where email_key=p_key;
    return case when found then to_jsonb(e) else 'null'::jsonb end;
  end if;
  raise exception 'Unsupported retry operation';
end;
$$;
revoke all on function public.checkout_retry_operation(text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.checkout_retry_operation(text,text,uuid,text,text) to service_role;
commit;
