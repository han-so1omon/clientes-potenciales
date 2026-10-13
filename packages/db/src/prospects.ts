import {
  addDays,
  FOLLOW_UP_DAYS,
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGES,
  type ProspectInput,
  type ProspectStage,
} from "@cp/core";
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { Db } from "./client";
import { auditLog, buyerProspects, prospectActivities } from "./schema";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Executor = Db | Tx;

export type Prospect = typeof buyerProspects.$inferSelect;
export type ProspectActivity = typeof prospectActivities.$inferSelect;

function toRow(input: ProspectInput) {
  return {
    name: input.name,
    company: input.company ?? null,
    type: input.type,
    email: input.email ?? null,
    phone: input.phone ?? null,
    website: input.website ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    licensedStates: input.licensedStates,
    lines: input.lines,
    languages: input.languages,
    npn: input.npn ?? null,
    source: input.source ?? null,
    notes: input.notes ?? null,
  };
}

/** An existing prospect with the same email (case-insensitive) or NPN, if any. */
export async function findDuplicateProspect(
  db: Executor,
  input: Pick<ProspectInput, "email" | "npn">,
  excludeId?: string,
): Promise<Prospect | undefined> {
  const matches = [
    ...(input.email ? [sql`lower(${buyerProspects.email}) = ${input.email.toLowerCase()}`] : []),
    ...(input.npn ? [eq(buyerProspects.npn, input.npn)] : []),
  ];
  if (matches.length === 0) return undefined;
  const rows = await db
    .select()
    .from(buyerProspects)
    .where(or(...matches))
    .limit(2);
  return rows.find((row) => row.id !== excludeId);
}

export type SaveProspectResult =
  | { kind: "saved"; id: string }
  | { kind: "duplicate"; existingId: string; existingName: string };

export async function createProspect(
  db: Db,
  input: ProspectInput,
  actor: string,
): Promise<SaveProspectResult> {
  return db.transaction(async (tx) => {
    const duplicate = await findDuplicateProspect(tx, input);
    if (duplicate)
      return { kind: "duplicate", existingId: duplicate.id, existingName: duplicate.name };
    const [row] = await tx
      .insert(buyerProspects)
      .values(toRow(input))
      .returning({ id: buyerProspects.id });
    if (!row) throw new Error("prospect insert returned no row");
    await tx.insert(prospectActivities).values({
      prospectId: row.id,
      type: "created",
      summary: "Added to buyer finder",
      actor,
    });
    await tx
      .insert(auditLog)
      .values({ actor, action: "prospect.create", entityType: "prospect", entityId: row.id });
    return { kind: "saved", id: row.id };
  });
}

export async function updateProspect(
  db: Db,
  id: string,
  input: ProspectInput,
  actor: string,
): Promise<SaveProspectResult> {
  return db.transaction(async (tx) => {
    const duplicate = await findDuplicateProspect(tx, input, id);
    if (duplicate)
      return { kind: "duplicate", existingId: duplicate.id, existingName: duplicate.name };
    await tx.update(buyerProspects).set(toRow(input)).where(eq(buyerProspects.id, id));
    await tx
      .insert(auditLog)
      .values({ actor, action: "prospect.update", entityType: "prospect", entityId: id });
    return { kind: "saved", id };
  });
}

export interface ImportSummary {
  created: number;
  duplicates: { row: number; name: string }[];
}

/** Bulk import from a validated CSV. Skips duplicates (by email/NPN), including within the file. */
export async function importProspects(
  db: Db,
  rows: { row: number; input: ProspectInput }[],
  input: { actor: string; fileName: string },
): Promise<ImportSummary> {
  return db.transaction(async (tx) => {
    const summary: ImportSummary = { created: 0, duplicates: [] };
    for (const { row, input: prospect } of rows) {
      if (await findDuplicateProspect(tx, prospect)) {
        summary.duplicates.push({ row, name: prospect.name });
        continue;
      }
      const [created] = await tx
        .insert(buyerProspects)
        .values(toRow(prospect))
        .returning({ id: buyerProspects.id });
      if (!created) throw new Error("prospect insert returned no row");
      await tx.insert(prospectActivities).values({
        prospectId: created.id,
        type: "imported",
        summary: `Imported from ${input.fileName} (row ${row})`,
        actor: input.actor,
      });
      summary.created++;
    }
    await tx.insert(auditLog).values({
      actor: input.actor,
      action: "prospect.import",
      entityType: "prospect",
      details: {
        fileName: input.fileName,
        created: summary.created,
        duplicates: summary.duplicates.length,
      },
    });
    return summary;
  });
}

export interface ProspectFilters {
  stage?: ProspectStage;
  /** Licensed in this state. */
  state?: string;
  /** Sells this line. */
  line?: string;
  /** Only prospects whose follow-up date is today or earlier. */
  followUpDue?: boolean;
  /** Name, company, or email contains this text. */
  search?: string;
}

export async function listProspects(db: Db, filters: ProspectFilters, today: Date, limit = 500) {
  const conditions = [
    filters.stage ? eq(buyerProspects.stage, filters.stage) : undefined,
    filters.state ? arrayContains(buyerProspects.licensedStates, [filters.state]) : undefined,
    filters.line ? arrayContains(buyerProspects.lines, [filters.line]) : undefined,
    filters.followUpDue
      ? and(
          isNotNull(buyerProspects.nextFollowUpOn),
          lte(buyerProspects.nextFollowUpOn, addDays(today, 0)),
        )
      : undefined,
    filters.search
      ? or(
          ilike(buyerProspects.name, `%${escapeLike(filters.search)}%`),
          ilike(buyerProspects.company, `%${escapeLike(filters.search)}%`),
          ilike(buyerProspects.email, `%${escapeLike(filters.search)}%`),
        )
      : undefined,
  ].filter((c) => c !== undefined);

  return db
    .select()
    .from(buyerProspects)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${buyerProspects.nextFollowUpOn} ASC NULLS LAST`, asc(buyerProspects.name))
    .limit(limit);
}

function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Number of prospects in each pipeline stage (every stage present, zero if none). */
export async function pipelineCounts(db: Db): Promise<Record<ProspectStage, number>> {
  const rows = await db
    .select({ stage: buyerProspects.stage, n: count() })
    .from(buyerProspects)
    .groupBy(buyerProspects.stage);
  const counts = Object.fromEntries(PROSPECT_STAGES.map((s) => [s, 0])) as Record<
    ProspectStage,
    number
  >;
  for (const row of rows) counts[row.stage] = row.n;
  return counts;
}

export async function getProspect(db: Db, id: string) {
  const [prospect] = await db.select().from(buyerProspects).where(eq(buyerProspects.id, id));
  if (!prospect) return undefined;
  const activities = await db
    .select()
    .from(prospectActivities)
    .where(eq(prospectActivities.prospectId, id))
    .orderBy(desc(prospectActivities.createdAt));
  const emailsSent = activities.filter((a) => a.type === "email_sent").length;
  return { prospect, activities, emailsSent };
}

async function logActivity(
  tx: Tx,
  prospectId: string,
  activity: { type: ProspectActivity["type"]; summary: string; details?: Record<string, unknown> },
  actor: string,
) {
  await tx
    .insert(prospectActivities)
    .values({ prospectId, ...activity, details: activity.details ?? {}, actor });
}

export async function setProspectStage(db: Db, id: string, stage: ProspectStage, actor: string) {
  await db.transaction(async (tx) => {
    const [before] = await tx.select().from(buyerProspects).where(eq(buyerProspects.id, id));
    if (!before || before.stage === stage) return;
    await tx.update(buyerProspects).set({ stage }).where(eq(buyerProspects.id, id));
    await logActivity(
      tx,
      id,
      {
        type: "stage_change",
        summary: `Stage: ${PROSPECT_STAGE_LABELS[before.stage]} → ${PROSPECT_STAGE_LABELS[stage]}`,
        details: { from: before.stage, to: stage },
      },
      actor,
    );
    await tx.insert(auditLog).values({
      actor,
      action: "prospect.stage",
      entityType: "prospect",
      entityId: id,
      details: { from: before.stage, to: stage },
    });
  });
}

/** Sets or clears the next follow-up date (YYYY-MM-DD). */
export async function setFollowUp(db: Db, id: string, date: string | null) {
  await db.update(buyerProspects).set({ nextFollowUpOn: date }).where(eq(buyerProspects.id, id));
}

/** Marks a prospect as not to be emailed (CAN-SPAM opt-out) or clears the flag. */
export async function setDoNotContact(db: Db, id: string, doNotContact: boolean, actor: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(buyerProspects)
      .set({ doNotContact, ...(doNotContact ? { nextFollowUpOn: null } : {}) })
      .where(eq(buyerProspects.id, id));
    await logActivity(
      tx,
      id,
      {
        type: "do_not_contact",
        summary: doNotContact ? "Marked do not contact" : "Do-not-contact removed",
      },
      actor,
    );
    await tx.insert(auditLog).values({
      actor,
      action: doNotContact ? "prospect.do_not_contact" : "prospect.allow_contact",
      entityType: "prospect",
      entityId: id,
    });
  });
}

export async function addProspectNote(
  db: Db,
  id: string,
  note: { type: "note" | "call" | "trial"; summary: string },
  actor: string,
) {
  await db.transaction(async (tx) => {
    await logActivity(tx, id, note, actor);
    if (note.type === "call") {
      await tx
        .update(buyerProspects)
        .set({ lastContactedAt: new Date() })
        .where(eq(buyerProspects.id, id));
    }
  });
}

export type RecordEmailResult =
  | { kind: "recorded"; nextFollowUpOn: string }
  | { kind: "do_not_contact" };

/**
 * Records that the owner sent an outreach email: logs it, moves a fresh prospect to "contacted",
 * and schedules a follow-up FOLLOW_UP_DAYS later.
 */
export async function recordEmailSent(
  db: Db,
  id: string,
  email: { subject: string; body: string },
  now: Date,
  actor: string,
): Promise<RecordEmailResult> {
  return db.transaction(async (tx) => {
    const [prospect] = await tx.select().from(buyerProspects).where(eq(buyerProspects.id, id));
    if (!prospect) throw new Error("prospect not found");
    if (prospect.doNotContact) return { kind: "do_not_contact" };
    const nextFollowUpOn = addDays(now, FOLLOW_UP_DAYS);
    await tx
      .update(buyerProspects)
      .set({
        lastContactedAt: now,
        nextFollowUpOn,
        ...(prospect.stage === "prospect" ? { stage: "contacted" as const } : {}),
      })
      .where(eq(buyerProspects.id, id));
    await logActivity(
      tx,
      id,
      { type: "email_sent", summary: `Email sent: ${email.subject}`, details: email },
      actor,
    );
    if (prospect.stage === "prospect") {
      await logActivity(
        tx,
        id,
        {
          type: "stage_change",
          summary: "Stage: Prospect → Contacted",
          details: { from: "prospect", to: "contacted" },
        },
        actor,
      );
    }
    return { kind: "recorded", nextFollowUpOn };
  });
}
