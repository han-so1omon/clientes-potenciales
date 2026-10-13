import type { NormalizedLead } from "@cp/core";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { getActiveConsentVersion } from "./consent";
import { createLeadFromLandingPage, getLeadDetail, sellableLeadsForExport } from "./leads";
import { auditLog, consentSnapshots, consentVersions, leads } from "./schema";
import { seed } from "./seed";
import { suppressConsumer } from "./suppression";
import { TEST_DATABASE_URL } from "./test/globalSetup";

const SECRET = "test-secret-at-least-16-chars";
const db = createDb(TEST_DATABASE_URL, { max: 2 });
const consent = {
  consentedAt: new Date("2026-10-13T15:00:00Z"),
  ipAddress: "203.0.113.5",
  userAgent: "test",
  pageUrl: "https://example.com/en/final-expense",
};

function sampleLead(
  consentVersionId: string,
  overrides: Partial<NormalizedLead> = {},
): NormalizedLead {
  return {
    line: "final_expense",
    language: "en",
    consentVersionId,
    firstName: "Ann",
    lastName: "Lee",
    phoneE164: "+13055551234",
    email: "ann@example.com",
    dateOfBirth: "1958-04-12",
    ageAtSubmission: 68,
    zip: "33101",
    state: "FL",
    timeZone: "America/New_York",
    coverageAmount: "10000",
    bestTimeToCall: "morning",
    campaignCode: undefined,
    utm: {},
    trustedFormCertUrl: "https://cert.trustedform.com/abc",
    formFillSeconds: 60,
    ...overrides,
  };
}

let enVersionId: string;

beforeAll(async () => {
  await seed(db);
  const version = await getActiveConsentVersion(db, "final_expense", "en");
  if (!version) throw new Error("seed did not create consent version");
  enVersionId = version.id;
});

beforeEach(async () => {
  // Immutable tables cannot be deleted from row by row; TRUNCATE bypasses row triggers in tests only.
  await db.execute(sql`TRUNCATE consent_snapshots, leads, suppressions, audit_log`);
});

afterAll(async () => {
  await db.$client.end();
});

describe("createLeadFromLandingPage", () => {
  it("stores the lead and a consent snapshot with the exact disclosure text", async () => {
    const result = await createLeadFromLandingPage(db, sampleLead(enVersionId), consent, SECRET);
    if (result.kind !== "created") throw new Error(result.kind);

    const detail = await getLeadDetail(db, result.leadId);
    expect(detail?.lead.status).toBe("received");
    expect(detail?.lead.phoneHash).toHaveLength(64);
    expect(detail?.source?.channel).toBe("landing_page");
    const [version] = await db
      .select()
      .from(consentVersions)
      .where(eq(consentVersions.id, enVersionId));
    expect(detail?.consent?.snapshot.renderedText).toBe(version?.text);
    expect(detail?.consent?.snapshot.ipAddress).toBe("203.0.113.5");
  });

  it("attributes the lead to a campaign by code", async () => {
    const result = await createLeadFromLandingPage(
      db,
      sampleLead(enVersionId, { campaignCode: "EXAMPLE-MAILER" }),
      consent,
      SECRET,
    );
    if (result.kind !== "created") throw new Error(result.kind);
    const detail = await getLeadDetail(db, result.leadId);
    expect(detail?.campaign?.code).toBe("EXAMPLE-MAILER");
    expect(detail?.source?.channel).toBe("mailer");
  });

  it("refuses a consent version that does not match the language", async () => {
    const result = await createLeadFromLandingPage(
      db,
      sampleLead(enVersionId, { language: "es" }),
      consent,
      SECRET,
    );
    expect(result.kind).toBe("consent_version_unavailable");
    expect(await db.select().from(leads)).toHaveLength(0);
  });

  it("marks a lead suppressed at intake when the consumer opted out before", async () => {
    await suppressConsumer(
      db,
      { phoneE164: "+13055551234", reason: "opt-out", source: "web", actor: "consumer" },
      SECRET,
    );
    const result = await createLeadFromLandingPage(db, sampleLead(enVersionId), consent, SECRET);
    if (result.kind !== "created") throw new Error(result.kind);
    const detail = await getLeadDetail(db, result.leadId);
    expect(detail?.lead.status).toBe("suppressed");
    expect(detail?.blockers).toContain("suppressed");
  });
});

describe("compliance gates", () => {
  it("draft (unapproved) consent makes a lead unsellable and excluded from export", async () => {
    const result = await createLeadFromLandingPage(db, sampleLead(enVersionId), consent, SECRET);
    if (result.kind !== "created") throw new Error(result.kind);
    const detail = await getLeadDetail(db, result.leadId);
    expect(detail?.blockers).toEqual(["consent_not_counsel_approved"]);
    expect(await sellableLeadsForExport(db)).toHaveLength(0);
  });

  it("exports leads only once consent is approved and a certificate exists", async () => {
    await db
      .update(consentVersions)
      .set({ counselApprovedAt: new Date() })
      .where(eq(consentVersions.id, enVersionId));
    try {
      await createLeadFromLandingPage(db, sampleLead(enVersionId), consent, SECRET);
      await createLeadFromLandingPage(
        db,
        sampleLead(enVersionId, { phoneE164: "+13055559876", trustedFormCertUrl: undefined }),
        consent,
        SECRET,
      );
      const rows = await sellableLeadsForExport(db);
      expect(rows.map((r) => r.lead.phoneE164)).toEqual(["+13055551234"]);
    } finally {
      await db
        .update(consentVersions)
        .set({ counselApprovedAt: null })
        .where(eq(consentVersions.id, enVersionId));
    }
  });
});

describe("suppressConsumer", () => {
  it("suppresses existing leads matched by email and writes an audit entry", async () => {
    const result = await createLeadFromLandingPage(db, sampleLead(enVersionId), consent, SECRET);
    if (result.kind !== "created") throw new Error(result.kind);
    const count = await suppressConsumer(
      db,
      { email: " ANN@example.com ", reason: "opt-out", source: "web", actor: "consumer" },
      SECRET,
    );
    expect(count).toBe(1);
    const [lead] = await db.select().from(leads).where(eq(leads.id, result.leadId));
    expect(lead?.status).toBe("suppressed");
    const audits = await db.select().from(auditLog);
    expect(audits.map((a) => a.action)).toEqual(["suppression.create"]);
  });
});

describe("database immutability", () => {
  it("blocks UPDATE and DELETE on consent snapshots", async () => {
    const result = await createLeadFromLandingPage(db, sampleLead(enVersionId), consent, SECRET);
    if (result.kind !== "created") throw new Error(result.kind);
    await expect(
      db
        .update(consentSnapshots)
        .set({ renderedText: "changed" })
        .where(eq(consentSnapshots.leadId, result.leadId)),
    ).rejects.toThrow();
    await expect(
      db.delete(consentSnapshots).where(eq(consentSnapshots.leadId, result.leadId)),
    ).rejects.toThrow();
  });

  it("blocks editing consent wording but allows approval and activation changes", async () => {
    await expect(
      db
        .update(consentVersions)
        .set({ text: "new wording" })
        .where(eq(consentVersions.id, enVersionId)),
    ).rejects.toThrow();
    await expect(
      db.delete(consentVersions).where(eq(consentVersions.id, enVersionId)),
    ).rejects.toThrow();
    await db
      .update(consentVersions)
      .set({ active: true })
      .where(eq(consentVersions.id, enVersionId));
  });

  it("keeps the audit log append-only", async () => {
    await db.insert(auditLog).values({ actor: "t", action: "x", entityType: "y" });
    await expect(db.update(auditLog).set({ action: "z" })).rejects.toThrow();
    await expect(db.delete(auditLog)).rejects.toThrow();
  });
});
