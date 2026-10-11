import { randomUUID } from 'node:crypto';
import { checkoutRetryLocalDatabase, checkoutRetryRpc } from './db';

export function stripeRetrySafetyEnabled() {
  return process.env.STRIPE_RETRY_SAFE_FULFILLMENT_ENABLED === 'true';
}

type Claim = { state: 'claimed' | 'busy' | 'completed'; token?: string };
export type RetryEmail = { encrypted_payload: string | null; first_attempt_at: string | null; sent_at: string | null };

async function operation<T>(op: string, key: string, token?: string, payload?: string, legacyEventId?: string): Promise<T> {
  if (key.length > 256 || !/^(stripe-event|raptor-order|raptor-welcome):[a-zA-Z0-9_-]+$/.test(key)) throw Error('Invalid retry key');
  const db = checkoutRetryLocalDatabase();
  if (!db) return checkoutRetryRpc<T>({ p_operation: op, p_key: key, p_token: token || null,
    p_payload: payload || null, p_legacy_event_id: legacyEventId || null });
  const now = new Date().toISOString();
  db.exec('BEGIN IMMEDIATE');
  try {
    let result: unknown;
    if (op === 'claim') {
      const row = db.prepare('SELECT * FROM checkout_retry_work WHERE work_key=?').get(key);
      const legacy = !row && legacyEventId && db.prepare("SELECT id FROM webhook_events WHERE provider='stripe' AND event_id=?").get(legacyEventId);
      if (legacy && key !== `stripe-event:${legacyEventId}`) throw Error('Invalid legacy key');
      if (legacy) db.prepare("INSERT INTO checkout_retry_work(work_key,state) VALUES(?,'completed')").run(key);
      if (legacy || row?.state === 'completed') result = { state: 'completed' };
      else if (row?.state === 'processing' && String(row.lease_until) > now) result = { state: 'busy' };
      else {
        db.prepare(`INSERT INTO checkout_retry_work(work_key,state,token,lease_until,attempts) VALUES(?,'processing',?,?,1)
          ON CONFLICT(work_key) DO UPDATE SET state='processing',token=excluded.token,lease_until=excluded.lease_until,attempts=checkout_retry_work.attempts+1`)
          .run(key, token, new Date(Date.now() + 300_000).toISOString());
        result = { state: 'claimed', token };
      }
    } else if (op === 'complete' || op === 'release') {
      const update = db.prepare(`UPDATE checkout_retry_work SET state=?,token=NULL,lease_until=NULL
        WHERE work_key=? AND state='processing' AND token=? AND lease_until>?`)
        .run(op === 'complete' ? 'completed' : 'failed', key, token, now);
      result = { updated: update.changes === 1 };
    } else {
      if (!key.startsWith('raptor-welcome:')) throw Error('Invalid email key');
      if (op === 'prepare_email') db.prepare('INSERT OR IGNORE INTO checkout_retry_email(email_key,encrypted_payload) VALUES(?,?)').run(key, payload);
      else if (op === 'start_email') db.prepare('UPDATE checkout_retry_email SET first_attempt_at=COALESCE(first_attempt_at,?) WHERE email_key=?').run(now,key);
      else if (op === 'sent_email') db.prepare('UPDATE checkout_retry_email SET sent_at=COALESCE(sent_at,?),encrypted_payload=NULL WHERE email_key=?').run(now,key);
      else if (op !== 'get_email') throw Error('Unsupported retry operation');
      result = db.prepare('SELECT encrypted_payload,first_attempt_at,sent_at FROM checkout_retry_email WHERE email_key=?').get(key) || null;
    }
    db.exec('COMMIT');
    return result as T;
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

export async function claimRetryWork(key: string, legacyEventId?: string) {
  return operation<Claim>('claim',key,randomUUID(),undefined,legacyEventId);
}
export async function finishRetryWork(key: string, token: string, success: boolean) {
  const result = await operation<{ updated: boolean }>(success ? 'complete' : 'release',key,token);
  if (!result.updated) throw Error('Retry processing ownership expired');
}
export const readRetryEmail = (key: string) => operation<RetryEmail | null>('get_email',key);
export const prepareRetryEmail = (key: string, encrypted: string) => operation<RetryEmail>('prepare_email',key,undefined,encrypted);
export const startRetryEmail = (key: string) => operation<RetryEmail>('start_email',key);
export const markRetryEmailSent = (key: string) => operation<RetryEmail>('sent_email',key);
