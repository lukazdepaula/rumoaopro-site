import crypto from "node:crypto";

type AdminSecurityEvent =
  | "password_failed"
  | "password_rate_limited"
  | "password_verified"
  | "mfa_failed"
  | "mfa_rate_limited"
  | "mfa_verified"
  | "mfa_enrolled"
  | "recovery_code_used";

function fingerprint(value: string) {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

export function logAdminSecurityEvent(
  event: AdminSecurityEvent,
  email: string
) {
  const payload = {
    scope: "admin_auth",
    event,
    account: fingerprint(email),
    occurredAt: new Date().toISOString()
  };

  if (event.endsWith("failed") || event.endsWith("limited")) {
    console.warn("[security.admin]", JSON.stringify(payload));
    return;
  }

  console.info("[security.admin]", JSON.stringify(payload));
}
