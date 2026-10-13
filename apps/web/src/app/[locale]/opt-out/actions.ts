"use server";

import { normalizeEmail, normalizeUsPhone } from "@cp/core";
import { suppressConsumer } from "@cp/db";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { serverEnv } from "@/lib/env";

export type OptOutState = { status: "idle" | "done" | "need_one" | "error" };

const optOutSchema = z.object({
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().max(200).optional(),
});

/**
 * Consumer opt-out. Always reports success for a well-formed request, so the page never
 * reveals whether we hold data about someone.
 */
export async function optOut(_prev: OptOutState, formData: FormData): Promise<OptOutState> {
  const parsed = optOutSchema.safeParse({
    phone: formData.get("phone") ?? undefined,
    email: formData.get("email") ?? undefined,
  });
  if (!parsed.success) return { status: "need_one" };

  const phoneE164 = parsed.data.phone ? normalizeUsPhone(parsed.data.phone) : undefined;
  const emailOk = parsed.data.email ? z.email().safeParse(parsed.data.email).success : false;
  const email = emailOk && parsed.data.email ? normalizeEmail(parsed.data.email) : undefined;
  if (!phoneE164 && !email) return { status: "need_one" };

  try {
    await suppressConsumer(
      getDb(),
      { phoneE164, email, reason: "consumer opt-out", source: "web_opt_out", actor: "consumer" },
      serverEnv().PII_HASH_SECRET,
    );
  } catch (error) {
    console.error("opt-out failed", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
  return { status: "done" };
}
