"use server";

import {
  describeIssues,
  isLanguage,
  isLine,
  MAX_IMPORT_ROWS,
  outreachFooter,
  PROSPECT_STAGES,
  parseProspectCsv,
  prospectInputSchema,
} from "@cp/core";
import {
  addProspectNote,
  createProspect,
  getProspect,
  importProspects,
  listEnabledLines,
  listEnabledStates,
  recordEmailSent,
  setDoNotContact,
  setFollowUp,
  setProspectStage,
  updateProspect,
  writeAudit,
} from "@cp/db";
import { createOutreachWriter } from "@cp/integrations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminSession";
import { getDb } from "@/lib/db";
import { outreachEnv } from "@/lib/env";

const ACTOR = "owner";

export type FormState = {
  status: "idle" | "error" | "saved";
  messages?: string[];
  values?: Record<string, string>;
};

/** Reads the shared prospect form (multi-value checkboxes for lines and languages). */
function readProspectForm(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") values[key] = value;
  const record = {
    ...values,
    lines: formData.getAll("lines").map(String),
    languages: formData.getAll("languages").map(String),
  };
  return { values, parsed: prospectInputSchema.safeParse(record) };
}

export async function createProspectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { values, parsed } = readProspectForm(formData);
  if (!parsed.success) return { status: "error", messages: describeIssues(parsed.error), values };
  const result = await createProspect(getDb(), parsed.data, ACTOR);
  if (result.kind === "duplicate") {
    return {
      status: "error",
      messages: [`A prospect with this email or NPN already exists: ${result.existingName}`],
      values,
    };
  }
  redirect(`/admin/prospects/${result.id}`);
}

export async function updateProspectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const { values, parsed } = readProspectForm(formData);
  if (!parsed.success) return { status: "error", messages: describeIssues(parsed.error), values };
  const result = await updateProspect(getDb(), id, parsed.data, ACTOR);
  if (result.kind === "duplicate") {
    return {
      status: "error",
      messages: [`Another prospect has this email or NPN: ${result.existingName}`],
      values,
    };
  }
  revalidatePath(`/admin/prospects/${id}`);
  return { status: "saved" };
}

export async function setStageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const stage = z.enum(PROSPECT_STAGES).parse(formData.get("stage"));
  await setProspectStage(getDb(), id, stage, ACTOR);
  revalidatePath(`/admin/prospects/${id}`);
}

export async function setFollowUpAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const raw = String(formData.get("nextFollowUpOn") ?? "");
  const date = raw ? z.iso.date().parse(raw) : null;
  await setFollowUp(getDb(), id, date);
  revalidatePath(`/admin/prospects/${id}`);
}

export async function setDoNotContactAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  await setDoNotContact(getDb(), id, formData.get("doNotContact") === "true", ACTOR);
  revalidatePath(`/admin/prospects/${id}`);
}

export async function addNoteAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const type = z.enum(["note", "call", "trial"]).parse(formData.get("type"));
  const summary = z.string().trim().min(1).max(2000).safeParse(formData.get("summary"));
  if (!summary.success) return;
  await addProspectNote(getDb(), id, { type, summary: summary.data }, ACTOR);
  revalidatePath(`/admin/prospects/${id}`);
}

export interface DraftResult {
  status: "drafted" | "error";
  message?: string;
  subject?: string;
  body?: string;
  footer?: string;
  source?: "ai" | "template";
  warning?: string;
}

/** Drafts an outreach email (Claude if configured, else template). Nothing is sent. */
export async function draftEmailAction(prospectId: string, language: string): Promise<DraftResult> {
  await requireAdmin();
  const id = z.uuid().parse(prospectId);
  if (!isLanguage(language)) return { status: "error", message: "Unknown language" };
  const db = getDb();
  const detail = await getProspect(db, id);
  if (!detail) return { status: "error", message: "Prospect not found" };
  const { prospect, emailsSent } = detail;
  if (prospect.doNotContact)
    return { status: "error", message: "This prospect asked not to be contacted." };

  const env = outreachEnv();
  const ctx = {
    prospect: {
      name: prospect.name,
      company: prospect.company ?? undefined,
      type: prospect.type,
      licensedStates: prospect.licensedStates,
      lines: prospect.lines.filter(isLine),
      languages: prospect.languages.filter(isLanguage),
      notes: prospect.notes ?? undefined,
    },
    offeredLines: await listEnabledLines(db),
    serviceStates: await listEnabledStates(db),
    senderName: env.OUTREACH_SENDER_NAME || "[Your name]",
    businessName: env.BUSINESS_NAME || "[Business name]",
    touch: emailsSent + 1,
    language,
  };
  const draft = await createOutreachWriter(env.ANTHROPIC_API_KEY).draft(ctx);
  await writeAudit(db, {
    actor: ACTOR,
    action: "prospect.draft_email",
    entityType: "prospect",
    entityId: id,
    details: { source: draft.source, touch: ctx.touch, language },
  });
  return {
    status: "drafted",
    subject: draft.subject,
    body: draft.body,
    source: draft.source,
    warning: draft.warning,
    footer: outreachFooter({
      businessName: ctx.businessName,
      mailingAddress: env.BUSINESS_MAILING_ADDRESS || "[Mailing address]",
      language,
    }),
  };
}

const sentEmailSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(6000),
});

/** Logs that the owner sent the email from their own mail app. */
export async function markEmailSentAction(
  prospectId: string,
  email: { subject: string; body: string },
): Promise<{ status: "recorded" | "error"; message: string }> {
  await requireAdmin();
  const id = z.uuid().parse(prospectId);
  const parsed = sentEmailSchema.safeParse(email);
  if (!parsed.success) return { status: "error", message: "Subject and body are required." };
  const result = await recordEmailSent(getDb(), id, parsed.data, new Date(), ACTOR);
  revalidatePath(`/admin/prospects/${id}`);
  return result.kind === "recorded"
    ? { status: "recorded", message: `Logged. Next follow-up: ${result.nextFollowUpOn}.` }
    : { status: "error", message: "This prospect asked not to be contacted." };
}

export interface ImportState {
  status: "idle" | "done" | "error";
  message?: string;
  created?: number;
  duplicates?: { row: number; name: string }[];
  errors?: { row: number; messages: string[] }[];
  unknownColumns?: string[];
}

const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export async function importProspectsAction(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { status: "error", message: "Choose a CSV file." };
  if (file.size > MAX_IMPORT_BYTES)
    return { status: "error", message: "File is too large (max 2 MB)." };

  const parsed = parseProspectCsv(await file.text());
  if (parsed.prospects.length === 0) {
    return {
      status: "error",
      message: `No valid rows found (max ${MAX_IMPORT_ROWS} rows per file).`,
      errors: parsed.errors,
      unknownColumns: parsed.unknownColumns,
    };
  }
  const summary = await importProspects(getDb(), parsed.prospects, {
    actor: ACTOR,
    fileName: file.name,
  });
  revalidatePath("/admin/prospects");
  return {
    status: "done",
    created: summary.created,
    duplicates: summary.duplicates,
    errors: parsed.errors,
    unknownColumns: parsed.unknownColumns,
  };
}
