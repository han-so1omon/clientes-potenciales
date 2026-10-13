import { type ProspectInput, prospectInputSchema } from "@cp/core";
import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import {
  addProspectNote,
  createProspect,
  getProspect,
  importProspects,
  listProspects,
  pipelineCounts,
  recordEmailSent,
  setDoNotContact,
  setFollowUp,
  setProspectStage,
  updateProspect,
} from "./prospects";
import { auditLog } from "./schema";
import { TEST_DATABASE_URL } from "./test/globalSetup";

const db = createDb(TEST_DATABASE_URL, { max: 2 });
const today = new Date("2026-10-13T15:00:00Z");

function input(overrides: Record<string, unknown> = {}): ProspectInput {
  return prospectInputSchema.parse({
    name: "Ana Ruiz",
    company: "Ruiz Agency",
    type: "agency",
    email: "ana@ruiz.com",
    licensedStates: "FL;GA",
    lines: "long_term_care",
    languages: "en;es",
    npn: "1234567",
    ...overrides,
  });
}

async function create(overrides: Record<string, unknown> = {}): Promise<string> {
  const result = await createProspect(db, input(overrides), "owner");
  if (result.kind !== "saved") throw new Error(result.kind);
  return result.id;
}

beforeEach(async () => {
  await db.execute(sql`TRUNCATE buyer_prospects CASCADE`);
  await db.execute(sql`TRUNCATE audit_log`);
});

afterAll(async () => {
  await db.$client.end();
});

describe("create / update", () => {
  it("creates a prospect with a 'created' activity and audit entry", async () => {
    const id = await create();
    const detail = await getProspect(db, id);
    expect(detail?.prospect).toMatchObject({
      name: "Ana Ruiz",
      stage: "prospect",
      licensedStates: ["FL", "GA"],
    });
    expect(detail?.activities.map((a) => a.type)).toEqual(["created"]);
    expect((await db.select().from(auditLog)).map((a) => a.action)).toEqual(["prospect.create"]);
  });

  it("refuses duplicates by email (any case) or NPN", async () => {
    const id = await create();
    expect(
      await createProspect(db, input({ email: "ANA@ruiz.com", npn: undefined }), "owner"),
    ).toEqual({
      kind: "duplicate",
      existingId: id,
      existingName: "Ana Ruiz",
    });
    expect(await createProspect(db, input({ email: "other@x.com" }), "owner")).toMatchObject({
      kind: "duplicate",
    });
    expect(
      await createProspect(
        db,
        input({ email: undefined, npn: undefined, name: "No Contact" }),
        "owner",
      ),
    ).toMatchObject({
      kind: "saved",
    });
  });

  it("updates without tripping over its own email", async () => {
    const id = await create();
    expect(await updateProspect(db, id, input({ company: "New Name" }), "owner")).toEqual({
      kind: "saved",
      id,
    });
    expect((await getProspect(db, id))?.prospect.company).toBe("New Name");
  });
});

describe("import", () => {
  it("creates new rows and skips duplicates, including repeats within the file", async () => {
    await create();
    const summary = await importProspects(
      db,
      [
        { row: 2, input: input() },
        { row: 3, input: input({ name: "Bob", email: "bob@x.com", npn: "999" }) },
        { row: 4, input: input({ name: "Bob again", email: "BOB@x.com", npn: undefined }) },
      ],
      { actor: "owner", fileName: "list.csv" },
    );
    expect(summary).toEqual({
      created: 1,
      duplicates: [
        { row: 2, name: "Ana Ruiz" },
        { row: 4, name: "Bob again" },
      ],
    });
  });
});

describe("list and filters", () => {
  it("filters by stage, licensed state, line, search, and due follow-ups", async () => {
    const ana = await create();
    const bob = await create({
      name: "Bob Lee",
      company: "Lee Insurance",
      email: "bob@x.com",
      npn: "2",
      licensedStates: "TN",
      lines: "critical_illness",
    });
    await setProspectStage(db, bob, "replied", "owner");
    await setFollowUp(db, ana, "2026-10-10");

    const names = async (filters: Parameters<typeof listProspects>[1]) =>
      (await listProspects(db, filters, today)).map((p) => p.name);
    expect(await names({})).toEqual(["Ana Ruiz", "Bob Lee"]);
    expect(await names({ stage: "replied" })).toEqual(["Bob Lee"]);
    expect(await names({ state: "FL" })).toEqual(["Ana Ruiz"]);
    expect(await names({ line: "critical_illness" })).toEqual(["Bob Lee"]);
    expect(await names({ search: "ruiz" })).toEqual(["Ana Ruiz"]);
    expect(await names({ search: "%" })).toEqual([]);
    expect(await names({ followUpDue: true })).toEqual(["Ana Ruiz"]);
    expect(await pipelineCounts(db)).toMatchObject({ prospect: 1, replied: 1, paying: 0 });
  });
});

describe("outreach tracking", () => {
  it("recording a sent email moves a new prospect to contacted and schedules a follow-up", async () => {
    const id = await create();
    const result = await recordEmailSent(
      db,
      id,
      { subject: "Hello", body: "Body text here" },
      today,
      "owner",
    );
    expect(result).toEqual({ kind: "recorded", nextFollowUpOn: "2026-10-17" });
    const detail = await getProspect(db, id);
    expect(detail?.prospect.stage).toBe("contacted");
    expect(detail?.emailsSent).toBe(1);
    expect(detail?.activities.map((a) => a.type)).toEqual(
      expect.arrayContaining(["email_sent", "stage_change"]),
    );

    await setProspectStage(db, id, "replied", "owner");
    await recordEmailSent(db, id, { subject: "Again", body: "Body text here" }, today, "owner");
    expect((await getProspect(db, id))?.prospect.stage).toBe("replied");
  });

  it("blocks recording email to a do-not-contact prospect and clears its follow-up", async () => {
    const id = await create();
    await setFollowUp(db, id, "2026-10-20");
    await setDoNotContact(db, id, true, "owner");
    expect(
      await recordEmailSent(db, id, { subject: "Hi", body: "Body text here" }, today, "owner"),
    ).toEqual({
      kind: "do_not_contact",
    });
    expect((await getProspect(db, id))?.prospect.nextFollowUpOn).toBeNull();
  });

  it("logs notes and calls", async () => {
    const id = await create();
    await addProspectNote(db, id, { type: "call", summary: "Left voicemail" }, "owner");
    const detail = await getProspect(db, id);
    expect(detail?.activities[0]).toMatchObject({ type: "call", summary: "Left voicemail" });
    expect(detail?.prospect.lastContactedAt).not.toBeNull();
  });

  it("ignores a no-op stage change", async () => {
    const id = await create();
    await setProspectStage(db, id, "prospect", "owner");
    expect((await getProspect(db, id))?.activities).toHaveLength(1);
  });
});
