"use server";

import {
  isLanguage,
  isLine,
  LINE_CATALOG,
  parseLeadSubmission,
  type SubmissionErrorCode,
} from "@cp/core";
import { createLeadFromLandingPage, getLineSettings, listEnabledStates } from "@cp/db";
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
  const language = values.language && isLanguage(values.language) ? values.language : "en";
  const line = values.line && isLine(values.line) ? values.line : undefined;
  if (!line) return { errors: { form: "form" }, values };

  const db = getDb();
  const settings = await getLineSettings(db, line);
  // The line may have been switched off after the page loaded.
  if (!settings?.enabled) return { errors: { form: "form" }, values };

  const now = new Date();
  const result = parseLeadSubmission(
    { ...values, trustedFormCertUrl: values[TRUSTEDFORM_FIELD] },
    now,
    {
      minAge: settings.minAge,
      maxAge: settings.maxAge,
      enabledStates: await listEnabledStates(db),
    },
  );

  if (result.kind === "invalid") return { errors: result.errors, values };

  if (result.kind === "accepted") {
    const requestHeaders = await headers();
    let created: Awaited<ReturnType<typeof createLeadFromLandingPage>>;
    try {
      created = await createLeadFromLandingPage(
        db,
        result.lead,
        {
          consentedAt: now,
          ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
          userAgent: requestHeaders.get("user-agent") ?? undefined,
          pageUrl: requestHeaders.get("referer") ?? undefined,
        },
        serverEnv().PII_HASH_SECRET,
      );
    } catch (error) {
      // Never log the submission itself: it contains PII.
      console.error("lead submission failed", error instanceof Error ? error.message : error);
      return { errors: { form: "form" }, values };
    }
    if (created.kind !== "created") return { errors: { form: "form" }, values };
  }

  // Honeypot ("discarded") submissions also land here so bots see a normal success.
  redirect(`/${language}/${LINE_CATALOG[line].slug}/thank-you`);
}
