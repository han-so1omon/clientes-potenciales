/**
 * Idempotent seed: owner supplier, default landing-page source, an example mailer campaign,
 * and DRAFT consent versions (not counsel-approved, so leads captured with them are not sellable).
 */
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import { createDb, type Db, databaseUrl } from "./client";
import { campaigns, consentVersions, sources, suppliers } from "./schema";
import { DRAFT_CONSENT } from "./seedData/consent";

export async function seed(db: Db): Promise<void> {
  let [owner] = await db.select().from(suppliers).where(eq(suppliers.type, "owner"));
  if (!owner) {
    [owner] = await db.insert(suppliers).values({ name: "Owner", type: "owner" }).returning();
  }
  if (!owner) throw new Error("failed to create owner supplier");

  let [landing] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.supplierId, owner.id), eq(sources.channel, "landing_page")));
  if (!landing) {
    [landing] = await db
      .insert(sources)
      .values({ supplierId: owner.id, channel: "landing_page", name: "Website landing pages" })
      .returning();
  }

  let [mailer] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.supplierId, owner.id), eq(sources.channel, "mailer")));
  if (!mailer) {
    [mailer] = await db
      .insert(sources)
      .values({ supplierId: owner.id, channel: "mailer", name: "Direct mail" })
      .returning();
  }
  if (!mailer) throw new Error("failed to create mailer source");

  await db
    .insert(campaigns)
    .values({
      sourceId: mailer.id,
      code: "EXAMPLE-MAILER",
      name: "Example mailer drop",
      line: "final_expense",
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
