-- CHECKOUT database only. Apply first in isolated QA. Additive guards, no backfill.
begin;
create or replace function public.guard_closed_program_order()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.product_id in ('offseason_30_days','project_36','projeto_36_2022_pt','elanga_in_season','de_volta_aos_gramados_pt','power_pro')
    and ((old.status in ('refunded','cancelled') and new.status not in ('refunded','cancelled'))
      or (old.status='paid' and new.status in ('pending','failed'))) then
    raise exception 'Settled program order cannot be reopened or downgraded';
  end if;
  return new;
end;
$$;
drop trigger if exists checkout_closed_program_order on public.orders;
create trigger checkout_closed_program_order before update of status on public.orders
  for each row execute function public.guard_closed_program_order();

create or replace function public.guard_paid_order_entitlement()
returns trigger language plpgsql set search_path = '' as $$
declare purchase public.orders;
begin
  if new.access_status='active' and new.order_id is not null then
    -- Lock the authoritative row through this write; a refund waits and then
    -- revokes it, or wins first and prevents this grant. No read/write gap.
    select * into purchase from public.orders where id=new.order_id for update;
    if not found or purchase.status<>'paid' or purchase.product_id<>new.product_id then
      raise exception 'Active entitlement requires a matching paid order';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists checkout_paid_order_entitlement on public.entitlements;
create trigger checkout_paid_order_entitlement before insert or update on public.entitlements
  for each row execute function public.guard_paid_order_entitlement();
revoke all on function public.guard_closed_program_order(), public.guard_paid_order_entitlement() from public,anon,authenticated;
commit;
