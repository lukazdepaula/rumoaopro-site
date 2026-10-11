import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { readRetryEmail, prepareRetryEmail, startRetryEmail, markRetryEmailSent } from './retry-storage';

type MailBody = { from: string; to: string; subject: string; html: string; text?: string };
type SavedMail = { body: MailBody; actionUrl: string; createdAt: number };
const windowMs = 15 * 60_000;
const mailKey = (orderId: string) => `raptor-welcome:${orderId}`;

function encryptionKey() {
  const secret = process.env.CHECKOUT_DELIVERY_ENCRYPTION_KEY?.trim();
  if (!secret || secret.length < 32) throw Error('Retry-safe delivery encryption is not configured');
  return createHash('sha256').update(`checkout-delivery-v1:${secret}`).digest();
}
export function assertRetryEmailConfigured() { encryptionKey(); }
export const existingRaptorWelcome = (orderId: string) => readRetryEmail(mailKey(orderId));

function seal(value: SavedMail, key: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm',encryptionKey(),iv);
  cipher.setAAD(Buffer.from(key));
  const data = Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return [iv,cipher.getAuthTag(),data].map(part => part.toString('base64url')).join('.');
}
function open(value: string, key: string): SavedMail {
  try {
    const [iv,tag,data] = value.split('.').map(part => Buffer.from(part,'base64url'));
    const cipher = createDecipheriv('aes-256-gcm',encryptionKey(),iv);
    cipher.setAAD(Buffer.from(key)); cipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8'));
  } catch { throw Error('Saved delivery cannot be decrypted'); }
}

// Caller holds the order processing claim. Exact body and key survive process restarts.
// Stop conservatively after 15 minutes: no automatic resend outside the provider's
// deduplication window and no attempt to refresh a possibly-used personal link.
export async function sendRetrySafeRaptorEmail(orderId: string, current: SavedMail,
  validate: (saved: SavedMail) => boolean,
  send: (body: MailBody, idempotencyKey: string) => Promise<boolean>) {
  assertRetryEmailConfigured();
  const key = mailKey(orderId);
  let row = await readRetryEmail(key);
  if (row?.sent_at) return true;
  if (!row) {
    if (!validate(current)) throw Error('Unapproved delivery payload');
    row = await prepareRetryEmail(key,seal(current,key));
  }
  if (row.sent_at) return true;
  if (!row.encrypted_payload) throw Error('Saved delivery is incomplete');
  const saved = open(row.encrypted_payload,key);
  if (!saved.body || saved.body.to !== current.body.to || !validate(saved)
    || !Number.isFinite(saved.createdAt) || saved.createdAt > Date.now()
    || Date.now() - saved.createdAt >= windowMs) throw Error('Delivery requires manual review; no email resent');
  const attempt = await startRetryEmail(key);
  if (attempt.sent_at) return true;
  const firstAttempt = Date.parse(attempt.first_attempt_at || '');
  if (!Number.isFinite(firstAttempt) || Date.now() - firstAttempt >= windowMs) throw Error('Delivery retry window closed');
  if (!await send(saved.body,`raptor-welcome-v1/${orderId}`)) return false;
  // Persist before optional audit logging; a storage failure is retryable with the same payload.
  await markRetryEmailSent(key);
  return true;
}
