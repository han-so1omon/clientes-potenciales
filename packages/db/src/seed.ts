/**
 * Idempotent seed: owner supplier, default sources, an example mailer campaign, the product-line
 * catalog with default settings, service states, and DRAFT consent versions per line + language
 * (not counsel-approved, so leads captured with them are not sellable).
 * Never overwrites settings the admin has changed.
 */
import { fileURLToPath } from "node:url";
import { LINE_CATALOG, LINES, SERVICE_STATES } from "@cp/core";
import { and, eq } from "drizzle-orm";
import { createDb, type Db, databaseUrl } from "./client";
import {
  campaigns,
  consentVersions,
  insuranceLines,
  serviceStates,
  sources,
  suppliers,
} from "./schema";
import { DRAFT_CONSENT } from "./seedData/consent";

export async function seed(db: Db): Promise<void> {
  let [owner] = await db.select().from(suppliers).where(eq(suppliers.type, "owner"));
  if (!owner) {
    [owner] = await db.insert(suppliers).values({ name: "Owner", type: "owner" }).returning();
  }
  if (!owner) throw new Error("failed to create owner supplier");

  for (const [channel, name] of [
    ["landing_page", "Website landing pages"],
    ["mailer", "Direct mail"],
  ] as const) {
    const [existing] = await db
      .select()
      .from(sources)
      .where(and(eq(sources.supplierId, owner.id), eq(sources.channel, channel)));
    if (!existing) await db.insert(sources).values({ supplierId: owner.id, channel, name });
  }
  const [mailer] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.supplierId, owner.id), eq(sources.channel, "mailer")));
  if (!mailer) throw new Error("failed to create mailer source");

  for (const line of LINES) {
    const def = LINE_CATALOG[line];
    await db
      .insert(insuranceLines)
      .values({
        key: line,
        enabled: def.defaultEnabled,
        minAge: def.defaultMinAge,
        maxAge: def.defaultMaxAge,
      })
      .onConflictDoNothing();
  }

  for (const state of SERVICE_STATES) {
    await db.insert(serviceStates).values({ state, enabled: true }).onConflictDoNothing();
  }

  await db
    .insert(campaigns)
    .values({
      sourceId: mailer.id,
      code: "EXAMPLE-MAILER",
      name: "Example mailer drop",
      line: "long_term_care",
    })
    .onConflictDoNothing();

  for (const draft of DRAFT_CONSENT) {
    const existing = await db
      .select()
      .from(consentVersions)
      .where(
        and(eq(consentVersions.line, draft.line), eq(consentVersions.language, draft.language)),
      );
    if (existing.length === 0) {
      await db.insert(consentVersions).values({ ...draft, version: 1, active: true });
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = createDb(databaseUrl(), { max: 1 });
  await seed(db);
  await db.$client.end();
  console.log("Seed complete");
}
