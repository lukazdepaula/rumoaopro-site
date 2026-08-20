import crypto from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const RECOVERY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TOTP_DIGITS = 6;
const TOTP_PERIOD_SECONDS = 30;

function encryptionKey() {
  const configured = process.env.ADMIN_MFA_ENCRYPTION_KEY?.trim();
  if (configured && configured.length >= 32) {
    return crypto.createHash("sha256").update(configured).digest();
  }

  if (process.env.NODE_ENV === "production") return null;

  return crypto
    .createHash("sha256")
    .update(
      process.env.ADMIN_SESSION_SECRET?.trim() ||
        "development-admin-mfa-encryption-key"
    )
    .digest();
}

function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function encodeBase32(value: Buffer) {
  let bits = "";
  for (const byte of value) bits += byte.toString(2).padStart(8, "0");

  let encoded = "";
  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    encoded += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }
  return encoded;
}

function decodeBase32(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index < 0) throw new Error("Segredo TOTP inválido.");
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto
    .createHmac("sha1", decodeBase32(secret))
    .update(counterBuffer)
    .digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

function normalizedRecoveryCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isAdminMfaConfigured() {
  return Boolean(encryptionKey());
}

export function generateAdminMfaSecret() {
  return encodeBase32(crypto.randomBytes(20));
}

export function adminMfaOtpAuthUri(email: string, secret: string) {
  const issuer = "RumoAoPro Admin";
  const label = `${issuer}:${email.trim().toLowerCase()}`;
  const query = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS)
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${query.toString()}`;
}

export function verifyAdminTotp(
  secret: string,
  value: string,
  now = Date.now()
) {
  const code = value.replace(/\D/g, "");
  if (code.length !== TOTP_DIGITS) return null;

  const currentStep = Math.floor(now / 1000 / TOTP_PERIOD_SECONDS);
  for (const offset of [-1, 0, 1]) {
    const step = currentStep + offset;
    if (step >= 0 && safeEqual(code, hotp(secret, step))) return step;
  }
  return null;
}

export function encryptAdminMfaValue(value: string) {
  const key = encryptionKey();
  if (!key) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    tag.toString("base64url")
  ].join(".");
}

export function decryptAdminMfaValue(value: string) {
  const key = encryptionKey();
  if (!key) return null;

  const [version, ivValue, ciphertextValue, tagValue] = value.split(".");
  if (version !== "v1" || !ivValue || !ciphertextValue || !tagValue) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivValue, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    return null;
  }
}

export function generateAdminRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const bytes = crypto.randomBytes(12);
    let code = "";
    for (let index = 0; index < 12; index += 1) {
      code += RECOVERY_ALPHABET[bytes[index] % RECOVERY_ALPHABET.length];
    }
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
  });
}

export function hashAdminRecoveryCode(value: string) {
  const key = encryptionKey();
  if (!key) return null;
  const normalized = normalizedRecoveryCode(value);
  if (normalized.length !== 12) return null;
  return crypto.createHmac("sha256", key).update(normalized).digest("hex");
}

export function createAdminRecoveryDisplayValue(codes: string[]) {
  return encryptAdminMfaValue(
    JSON.stringify({
      codes,
      expires: Date.now() + 10 * 60 * 1000
    })
  );
}

export function readAdminRecoveryDisplayValue(value?: string | null) {
  if (!value) return null;
  const decrypted = decryptAdminMfaValue(value);
  if (!decrypted) return null;

  try {
    const payload = JSON.parse(decrypted) as {
      codes?: unknown;
      expires?: unknown;
    };
    if (
      !Array.isArray(payload.codes) ||
      !payload.codes.every((code) => typeof code === "string") ||
      typeof payload.expires !== "number" ||
      payload.expires < Date.now()
    ) {
      return null;
    }
    return payload.codes;
  } catch {
    return null;
  }
}
