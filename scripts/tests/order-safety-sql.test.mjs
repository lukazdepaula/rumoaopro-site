import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { DatabaseSync } from 'node:sqlite';

test('SQLite enforces terminal orders and paid entitlements even for direct database writes',()=>{
  const db=new DatabaseSync(':memory:');
  try {
    db.exec("CREATE TABLE orders(id TEXT,product_id TEXT,status TEXT);CREATE TABLE entitlements(id TEXT,order_id TEXT,product_id TEXT,access_status TEXT);");
    const source=readFileSync('lib/checkout/db.ts','utf8');
    const triggers=source.match(/CREATE TRIGGER IF NOT EXISTS checkout_[\s\S]*?END;/g);
    assert.equal(triggers.length,3);for(const sql of triggers)db.exec(sql);
    db.exec("INSERT INTO orders VALUES('one','power_pro','paid');INSERT INTO entitlements VALUES('access','one','power_pro','active')");
    assert.throws(()=>db.exec("UPDATE orders SET status='failed'"),/cannot be reopened/);
    db.exec("UPDATE orders SET status='refunded';UPDATE entitlements SET access_status='revoked'");
    assert.throws(()=>db.exec("UPDATE orders SET status='paid'"),/cannot be reopened/);
    assert.throws(()=>db.exec("UPDATE entitlements SET access_status='active'"),/matching paid order/);
    assert.throws(()=>db.exec("INSERT INTO entitlements VALUES('late','one','power_pro','active')"),/matching paid order/);
  } finally {db.close();}
});

test('Raptor SQL keeps revocations terminal, including delayed grants, absent users and multiple purchases',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role;
      create schema auth;create table auth.users(id uuid,email text);
      create table public.access_fixture(program_id text,email text,status text,order_id text,primary key(program_id,email));
      create function public.set_commercial_program_paid_access(p text,e text,s text,o text) returns jsonb language plpgsql as $$
      begin
        if not exists(select 1 from auth.users where email=e) then raise exception 'Auth user not found';end if;
        insert into public.access_fixture values(p,e,s,o) on conflict(program_id,email) do update set status=excluded.status,order_id=excluded.order_id;
        return jsonb_build_object('status',s,'orderId',o);
      end;$$;
      insert into auth.users values('00000000-0000-0000-0000-000000000001','athlete@example.invalid');`);
    const sql=readFileSync('supabase/raptor-order-access-safety.sql','utf8');
    await db.exec(sql);await db.exec(sql);
    const call=async(id,status,preserve=null,email='athlete@example.invalid',program='program')=>
      (await db.query('select set_commercial_program_paid_access_safe($1,$2,$3,$4,$5) as result',[program,email,status,id,preserve])).rows[0].result;
    await db.exec('set role service_role');
    assert.equal((await call('one','granted')).status,'granted');
    assert.equal((await call('one','revoked')).status,'revoked');
    await assert.rejects(call('one','granted'),/Closed order/);
    assert.equal((await call('two','granted')).status,'granted');
    assert.equal((await call('one','revoked')).status,'granted','a new paid purchase keeps access');
    assert.equal((await call('two','revoked')).status,'revoked');
    assert.equal((await call('one','revoked','two')).status,'revoked','stale preservation must not revive a refunded purchase');
    await assert.rejects(call('one','granted',null,'another@example.invalid'),/identity mismatch/);
    assert.equal((await call('before-invite','revoked',null,'new@example.invalid')).status,'revoked');
    await db.exec("reset role;insert into auth.users values('00000000-0000-0000-0000-000000000002','new@example.invalid');set role service_role");
    await assert.rejects(call('before-invite','granted',null,'new@example.invalid'),/Closed order/);
    assert.equal((await call('legacy-refund','revoked','legacy-valid')).status,'granted');
    assert.equal((await call('legacy-valid','revoked')).status,'revoked');
    for(const role of ['anon','authenticated']) {
      await db.exec(`reset role;set role ${role}`);
      await assert.rejects(call('attacker','granted'),/permission/);
      await assert.rejects(db.query('select * from commercial_program_order_access'),/permission/);
    }
  } finally {await db.close();}
});

test('checkout SQL refuses stale paid transitions and grants against refunded, unpaid or mismatched orders',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;
      create table orders(id text primary key,product_id text,status text);
      create table entitlements(id text primary key,order_id text,product_id text,access_status text);
      insert into orders values('paid','power_pro','paid'),('refund','power_pro','refunded'),('pending','power_pro','pending'),('subscription','loadpro_founders','cancelled');`);
    const sql=readFileSync('supabase/checkout-paid-order-safety.sql','utf8');
    await db.exec(sql);await db.exec(sql);
    await db.exec("insert into entitlements values('valid','paid','power_pro','active')");
    for(const order of ['refund','pending','missing']) {
      await assert.rejects(db.query('insert into entitlements values($1,$2,$3,$4)',['bad-'+order,order,'power_pro','active']),/matching paid order/);
    }
    await assert.rejects(db.exec("insert into entitlements values('mismatch','paid','project_36','active')"),/matching paid order/);
    await assert.rejects(db.exec("update orders set status='paid' where id='refund'"),/cannot be reopened/);
    await assert.rejects(db.exec("update orders set status='failed' where id='paid'"),/cannot be reopened/);
    await db.exec("update orders set status='refunded' where id='paid';update entitlements set access_status='revoked' where id='valid'");
    await assert.rejects(db.exec("update entitlements set access_status='active' where id='valid'"),/matching paid order/);
    await db.exec("update orders set status='paid' where id='subscription'");
    assert.equal((await db.query("select status from orders where id='subscription'")).rows[0].status,'paid','recurring LoadPro lifecycle unchanged');
  } finally {await db.close();}
});
