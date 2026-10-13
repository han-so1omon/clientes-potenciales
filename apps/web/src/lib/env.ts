import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PII_HASH_SECRET: z.string().min(16),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(16),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/** Validated server environment. Read lazily so `next build` works without secrets. */
export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse(process.env);
  return cached;
}

/** Read at request time (not inlined at build), so it can be flipped on the host without a rebuild. */
export function trustedFormEnabled(): boolean {
  return process.env.TRUSTEDFORM_ENABLED === "true";
}

const outreachEnvSchema = z.object({
  /** Optional: enables AI-drafted outreach emails. Without it, a built-in template is used. */
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
  OUTREACH_SENDER_NAME: z.string().default(""),
  BUSINESS_NAME: z.string().default(""),
  /** Physical postal address, required in commercial email by CAN-SPAM. */
  BUSINESS_MAILING_ADDRESS: z.string().default(""),
});

export type OutreachEnv = z.infer<typeof outreachEnvSchema> & { missing: string[] };

/** Settings for buyer outreach emails, with a list of anything still unset. */
export function outreachEnv(): OutreachEnv {
  const env = outreachEnvSchema.parse(process.env);
  const missing = (
    ["OUTREACH_SENDER_NAME", "BUSINESS_NAME", "BUSINESS_MAILING_ADDRESS"] as const
  ).filter((key) => !env[key]);
  return { ...env, missing };
}
