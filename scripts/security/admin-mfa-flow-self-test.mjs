import crypto from "node:crypto";

const baseUrl = process.env.MFA_TEST_BASE_URL || "http://localhost:4312";
const parsedBaseUrl = new URL(baseUrl);
if (!["localhost", "127.0.0.1"].includes(parsedBaseUrl.hostname)) {
  throw new Error("Este teste só pode ser executado contra localhost.");
}

const email = "admin@example.com";
const password = "Local-Mfa-Test-Password-2026";
const cookies = new Map();

function updateCookies(response) {
  const values = response.headers.getSetCookie?.() || [];
  for (const value of values) {
    const [pair] = value.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const cookieValue = pair.slice(separator + 1);
    if (/max-age=0/i.test(value)) cookies.delete(name);
    else cookies.set(name, cookieValue);
  }
}

function cookieHeader() {
  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (cookies.size) headers.set("cookie", cookieHeader());
  const response = await fetch(new URL(path, baseUrl), {
    ...options,
    headers,
    redirect: "manual"
  });
  updateCookies(response);
  return response;
}

async function postForm(path, values) {
  return request(path, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: baseUrl
    },
    body: new URLSearchParams(values)
  });
}

async function login() {
  return postForm("/api/admin/login", { email, password });
}

function pendingSetupSecret() {
  const pending = cookies.get("rap_admin_mfa_pending");
  if (!pending) throw new Error("Cookie temporário de MFA ausente.");
  const [payload] = decodeURIComponent(pending).split(".");
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!parsed.setupSecret) throw new Error("Segredo de configuração ausente.");
  return parsed.setupSecret;
}

function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of value) {
    bits += alphabet.indexOf(character).toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function currentTotp(secret) {
  const step = Math.floor(Date.now() / 1000 / 30);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = crypto
    .createHmac("sha1", decodeBase32(secret))
    .update(counter)
    .digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const firstLogin = await login();
expect(firstLogin.status === 303, "Login inicial não redirecionou.");
expect(
  firstLogin.headers.get("location")?.endsWith("/admin/mfa/setup"),
  "Login inicial não abriu a configuração de MFA."
);

const secret = pendingSetupSecret();
const setupPage = await request("/admin/mfa/setup");
expect(setupPage.status === 200, "Página de configuração indisponível.");
const setupCode = currentTotp(secret);
const setupResult = await postForm("/api/admin/mfa/setup", { code: setupCode });
expect(setupResult.status === 303, "Ativação de MFA não redirecionou.");
expect(
  setupResult.headers.get("location")?.endsWith("/admin/mfa/recovery-codes"),
  "Ativação de MFA não abriu os códigos de recuperação."
);

const recoveryPage = await request("/admin/mfa/recovery-codes");
expect(recoveryPage.status === 200, "Códigos de recuperação indisponíveis.");
const recoveryHtml = await recoveryPage.text();
const recoveryCodes = recoveryHtml.match(/[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){2}/g) || [];
expect(new Set(recoveryCodes).size === 10, "Quantidade de códigos de recuperação inválida.");
const recoveryCode = recoveryCodes[0];

const acknowledge = await postForm("/api/admin/mfa/recovery/acknowledge", {});
expect(acknowledge.status === 303, "Confirmação dos códigos falhou.");
const adminPage = await request("/admin");
expect(adminPage.status === 200, "Sessão completa de admin não foi criada.");

const secondLogin = await login();
expect(
  secondLogin.headers.get("location")?.endsWith("/admin/mfa"),
  "Login protegido não abriu o desafio de MFA."
);
const replay = await postForm("/api/admin/mfa/verify", { code: setupCode });
expect(
  replay.headers.get("location")?.includes("error=invalid"),
  "O mesmo TOTP foi aceito duas vezes."
);

const recoveryLogin = await postForm("/api/admin/mfa/verify", {
  code: recoveryCode
});
expect(
  recoveryLogin.headers.get("location")?.endsWith("/admin"),
  "Código de recuperação válido foi rejeitado."
);

await login();
const recoveryReplay = await postForm("/api/admin/mfa/verify", {
  code: recoveryCode
});
expect(
  recoveryReplay.headers.get("location")?.includes("error=invalid"),
  "Código de recuperação foi aceito duas vezes."
);

for (let attempt = 0; attempt < 4; attempt += 1) {
  const invalidAttempt = await postForm("/api/admin/mfa/verify", {
    code: "000000"
  });
  expect(
    invalidAttempt.headers.get("location")?.includes("error=invalid"),
    "Tentativa inválida não foi rejeitada."
  );
}
const rateLimited = await postForm("/api/admin/mfa/verify", { code: "000000" });
expect(
  rateLimited.headers.get("location")?.includes("error=rate-limit") &&
    Number(rateLimited.headers.get("retry-after")) > 0,
  "Limite de tentativas do segundo fator não foi aplicado."
);

const crossSite = await fetch(new URL("/api/admin/login", baseUrl), {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    origin: "https://evil.example"
  },
  body: new URLSearchParams({ email, password }),
  redirect: "manual"
});
expect(crossSite.status === 403, "Proteção contra origem maliciosa falhou.");

console.log(
  JSON.stringify({
    passwordStage: "ok",
    totpEnrollment: "ok",
    totpReplayBlocked: "ok",
    recoveryCodes: 10,
    recoveryReplayBlocked: "ok",
    mfaRateLimit: "ok",
    fullAdminSession: "ok",
    crossSiteBlocked: "ok"
  })
);
