import {
  isLine,
  type Language,
  LINES,
  type Line,
  type LineSettings,
  SERVICE_STATES,
  validateAgeRange,
} from "@cp/core";
import { asc, eq } from "drizzle-orm";
import type { Db } from "./client";
import { auditLog, consentVersions, insuranceLines, serviceStates } from "./schema";

/** Settings for one line, or undefined if the line is unknown or not seeded. */
export async function getLineSettings(db: Db, line: Line): Promise<LineSettings | undefined> {
  const [row] = await db.select().from(insuranceLines).where(eq(insuranceLines.key, line));
  return row ? { line, enabled: row.enabled, minAge: row.minAge, maxAge: row.maxAge } : undefined;
}

/** All known lines in catalog order, with live settings. */
export async function listLineSettings(db: Db): Promise<LineSettings[]> {
  const rows = await db.select().from(insuranceLines);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return LINES.flatMap((line) => {
    const row = byKey.get(line);
    return row ? [{ line, enabled: row.enabled, minAge: row.minAge, maxAge: row.maxAge }] : [];
  });
}

export async function listEnabledLines(db: Db): Promise<Line[]> {
  return (await listLineSettings(db)).filter((s) => s.enabled).map((s) => s.line);
}

export type UpdateLineResult = { kind: "updated" } | { kind: "invalid"; message: string };

/** Admin change to a line's availability or age range. Writes an audit entry. */
export async function updateLineSettings(
  db: Db,
  input: { line: string; enabled: boolean; minAge: number; maxAge: number; actor: string },
): Promise<UpdateLineResult> {
  if (!isLine(input.line)) return { kind: "invalid", message: "Unknown line" };
  const error = validateAgeRange(input.minAge, input.maxAge);
  if (error) return { kind: "invalid", message: error };

  return db.transaction(async (tx) => {
    const [before] = await tx
      .select()
      .from(insuranceLines)
      .where(eq(insuranceLines.key, input.line));
    if (!before) return { kind: "invalid", message: "Line is not set up; run the seed" } as const;
    await tx
      .update(insuranceLines)
      .set({ enabled: input.enabled, minAge: input.minAge, maxAge: input.maxAge })
      .where(eq(insuranceLines.key, input.line));
    await tx.insert(auditLog).values({
      actor: input.actor,
      action: "line.update",
      entityType: "insurance_line",
      entityId: input.line,
      details: {
        before: { enabled: before.enabled, minAge: before.minAge, maxAge: before.maxAge },
        after: { enabled: input.enabled, minAge: input.minAge, maxAge: input.maxAge },
      },
    });
    return { kind: "updated" } as const;
  });
}

export async function listServiceStates(db: Db) {
  return db.select().from(serviceStates).orderBy(asc(serviceStates.state));
}

export async function listEnabledStates(db: Db): Promise<string[]> {
  const rows = await db.select().from(serviceStates).where(eq(serviceStates.enabled, true));
  return rows.map((r) => r.state);
}

export async function setStateEnabled(
  db: Db,
  input: { state: string; enabled: boolean; actor: string },
): Promise<boolean> {
  if (!(SERVICE_STATES as readonly string[]).includes(input.state)) return false;
  await db.transaction(async (tx) => {
    await tx
      .update(serviceStates)
      .set({ enabled: input.enabled })
      .where(eq(serviceStates.state, input.state));
    await tx.insert(auditLog).values({
      actor: input.actor,
      action: input.enabled ? "state.enable" : "state.disable",
      entityType: "service_state",
      entityId: input.state,
    });
  });
  return true;
}

/** Consent status per line + language, for the admin markets page. */
export async function consentStatusByLine(db: Db) {
  const rows = await db
    .select({
      line: consentVersions.line,
      language: consentVersions.language,
      version: consentVersions.version,
      counselApprovedAt: consentVersions.counselApprovedAt,
    })
    .from(consentVersions)
    .where(eq(consentVersions.active, true));
  const status = new Map<string, { version: number; approved: boolean }>();
  for (const row of rows) {
    status.set(`${row.line}:${row.language}`, {
      version: row.version,
      approved: row.counselApprovedAt !== null,
    });
  }
  return (line: Line, language: Language) => status.get(`${line}:${language}`);
}
