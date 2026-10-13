import { createHmac } from "node:crypto";

/**
 * Keyed hash of a normalized identifier (E.164 phone or lowercase email).
 * Used for dedupe and the suppression list so they can be matched without exposing PII.
 */
export function piiHash(normalizedValue: string, secret: string): string {
  if (secret.length < 16) throw new Error("PII hash secret must be at least 16 characters");
  return createHmac("sha256", secret).update(normalizedValue).digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
