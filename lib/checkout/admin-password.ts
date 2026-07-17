import crypto from "node:crypto";

const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: SCRYPT_COST,
        r: SCRYPT_BLOCK_SIZE,
        p: SCRYPT_PARALLELIZATION,
        maxmem: 64 * 1024 * 1024
      },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      }
    );
  });
}

export function passwordValidationError(password: string) {
  if (password.length < 12) {
    return "A senha precisa ter pelo menos 12 caracteres.";
  }
  if (!/[a-zA-ZÀ-ÿ]/.test(password) || !/\d/.test(password)) {
    return "Use pelo menos uma letra e um número.";
  }
  return null;
}

export async function hashAdminPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const derivedKey = await deriveKey(password, salt);
  return [
    "scrypt",
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString("base64url"),
    derivedKey.toString("base64url")
  ].join("$");
}

export async function verifyAdminPasswordHash(password: string, encoded: string) {
  const [algorithm, cost, blockSize, parallelization, saltValue, hashValue] =
    encoded.split("$");

  if (
    algorithm !== "scrypt" ||
    Number(cost) !== SCRYPT_COST ||
    Number(blockSize) !== SCRYPT_BLOCK_SIZE ||
    Number(parallelization) !== SCRYPT_PARALLELIZATION ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  try {
    const expected = Buffer.from(hashValue, "base64url");
    const actual = await deriveKey(password, Buffer.from(saltValue, "base64url"));
    return (
      expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

export function createAdminResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashAdminResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
