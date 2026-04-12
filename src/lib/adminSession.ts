import { createHmac, randomBytes } from "crypto";

const SECRET =
  process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "fallback";

/** Create a signed session token (hex). */
export function createSessionToken(): string {
  const payload = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Verify a session token string. Returns true if valid. */
export function verifySessionToken(token: string): boolean {
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  // Constant-time comparison
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** Cookie name for the admin session. */
export const ADMIN_COOKIE = "kalima_admin_session";
