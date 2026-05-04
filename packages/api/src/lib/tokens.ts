import { createHash, randomBytes } from "node:crypto";

/** URL-safe token for email links (store only hash in DB). */
export function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
