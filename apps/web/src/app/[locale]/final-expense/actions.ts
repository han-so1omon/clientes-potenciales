"use server";

import { isLanguage, parseLeadSubmission, type SubmissionErrorCode } from "@cp/core";
import { createLeadFromLandingPage } from "@cp/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { serverEnv } from "@/lib/env";

export interface LeadFormState {
  errors: Partial<Record<string, SubmissionErrorCode | "form">>;
  /** Submitted values, echoed back so the form keeps them after an error. */
  values: Record<string, string>;
}

/** Name of the hidden field the TrustedForm script adds to the form. */
const TRUSTEDFORM_FIELD = "xxTrustedFormCertUrl";

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  const raw = { ...values, trustedFormCertUrl: values[TRUSTEDFORM_FIELD] };

  const now = new Date();
  const result = parseLeadSubmission(raw, now);
  const language = values.language && isLanguage(values.language) ? values.language : "en";

  if (result.kind === "invalid") return { errors: result.errors, values };

  if (result.kind === "accepted") {
    const requestHeaders = await headers();
    const env = serverEnv();
    let created: Awaited<ReturnType<typeof createLeadFromLandingPage>>;
    try {
      created = await createLeadFromLandingPage(
        getDb(),
        result.lead,
        {
          consentedAt: now,
          ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
          userAgent: requestHeaders.get("user-agent") ?? undefined,
          pageUrl: requestHeaders.get("referer") ?? undefined,
        },
        env.PII_HASH_SECRET,
      );
    } catch (error) {
      // Never log the submission itself: it contains PII.
      console.error("lead submission failed", error instanceof Error ? error.message : error);
      return { errors: { form: "form" }, values };
    }
    if (created.kind !== "created") return { errors: { form: "form" }, values };
  }

  // Honeypot ("discarded") submissions also land here so bots see a normal success.
  redirect(`/${language}/final-expense/thank-you`);
}
