import { type NormalizedLead, piiHash, sellabilityBlockers } from "@cp/core";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import type { Db } from "./client";
import {
  campaigns,
  consentSnapshots,
  consentVersions,
  leads,
  sources,
  suppliers,
  suppressions,
} from "./schema";

export interface ConsentContext {
  consentedAt: Date;
  ipAddress: string | undefined;
  userAgent: string | undefined;
  pageUrl: string | undefined;
}

export type CreateLeadResult =
  | { kind: "created"; leadId: string }
  | { kind: "consent_version_unavailable" };

/**
 * Stores a validated landing-page lead and its immutable consent snapshot in one transaction.
 * The consent text is copied from the active consent version the consumer saw.
 */
export async function createLeadFromLandingPage(
  db: Db,
  lead: NormalizedLead,
  consent: ConsentContext,
  hashSecret: string,
): Promise<CreateLeadResult> {
  return db.transaction(async (tx) => {
    const [version] = await tx
      .select()
      .from(consentVersions)
      .where(
        and(
          eq(consentVersions.id, lead.consentVersionId),
          eq(consentVersions.line, lead.line),
          eq(consentVersions.language, lead.language),
          eq(consentVersions.active, true),
        ),
      );
    if (!version) return { kind: "consent_version_unavailable" };

    const source = await landingPageSource(tx);
    const campaign = lead.campaignCode
      ? (await tx.select().from(campaigns).where(eq(campaigns.code, lead.campaignCode)))[0]
      : undefined;

    const phoneHash = piiHash(lead.phoneE164, hashSecret);
    const emailHash = lead.email ? piiHash(lead.email, hashSecret) : null;
    const suppressed = await isSuppressed(tx, phoneHash, emailHash);

    const [row] = await tx
      .insert(leads)
      .values({
        supplierId: source.supplierId,
        sourceId: campaign?.sourceId ?? source.id,
        campaignId: campaign?.id ?? null,
        line: lead.line,
        language: lead.language,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phoneE164: lead.phoneE164,
        phoneHash,
        email: lead.email ?? null,
        emailHash,
        dateOfBirth: lead.dateOfBirth,
        ageAtSubmission: lead.ageAtSubmission,
        zip: lead.zip,
        state: lead.state,
        timeZone: lead.timeZone,
        interest: lead.interest,
        bestTimeToCall: lead.bestTimeToCall,
        utm: { ...lead.utm, campaignCode: lead.campaignCode },
        formFillSeconds: lead.formFillSeconds ?? null,
        status: suppressed ? "suppressed" : "received",
        statusReason: suppressed ? "on suppression list at intake" : null,
      })
      .returning({ id: leads.id });
    if (!row) throw new Error("lead insert returned no row");

    await tx.insert(consentSnapshots).values({
      leadId: row.id,
      consentVersionId: version.id,
      renderedText: version.text,
      language: lead.language,
      consentedAt: consent.consentedAt,
      ipAddress: consent.ipAddress ?? null,
      userAgent: consent.userAgent ?? null,
      pageUrl: consent.pageUrl ?? null,
      trustedFormCertUrl: lead.trustedFormCertUrl ?? null,
    });

    return { kind: "created", leadId: row.id };
  });
}

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** The owner's default landing-page source (created by the seed script). */
async function landingPageSource(tx: Tx) {
  const [source] = await tx
    .select({ id: sources.id, supplierId: sources.supplierId })
    .from(sources)
    .innerJoin(suppliers, eq(sources.supplierId, suppliers.id))
    .where(and(eq(suppliers.type, "owner"), eq(sources.channel, "landing_page")))
    .limit(1);
  if (!source) throw new Error("No owner landing_page source found; run `pnpm db:seed`");
  return source;
}

async function isSuppressed(tx: Tx | Db, phoneHash: string, emailHash: string | null) {
  const match = await tx
    .select({ id: suppressions.id })
    .from(suppressions)
    .where(
      emailHash
        ? or(eq(suppressions.phoneHash, phoneHash), eq(suppressions.emailHash, emailHash))
        : eq(suppressions.phoneHash, phoneHash),
    )
    .limit(1);
  return match.length > 0;
}

export async function listRecentLeads(db: Db, limit = 100) {
  return db
    .select({
      id: leads.id,
      createdAt: leads.createdAt,
      firstName: leads.firstName,
      lastName: leads.lastName,
      phoneE164: leads.phoneE164,
      line: leads.line,
      state: leads.state,
      ageAtSubmission: leads.ageAtSubmission,
      language: leads.language,
      status: leads.status,
      campaignCode: campaigns.code,
      sourceName: sources.name,
    })
    .from(leads)
    .innerJoin(sources, eq(leads.sourceId, sources.id))
    .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

export async function getLeadDetail(db: Db, leadId: string) {
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) return undefined;
  const [snapshot] = await db
    .select({
      snapshot: consentSnapshots,
      versionNumber: consentVersions.version,
      counselApprovedAt: consentVersions.counselApprovedAt,
    })
    .from(consentSnapshots)
    .innerJoin(consentVersions, eq(consentSnapshots.consentVersionId, consentVersions.id))
    .where(eq(consentSnapshots.leadId, leadId));
  const [source] = await db.select().from(sources).where(eq(sources.id, lead.sourceId));
  const campaign = lead.campaignId
    ? (await db.select().from(campaigns).where(eq(campaigns.id, lead.campaignId)))[0]
    : undefined;

  const blockers = sellabilityBlockers({
    status: lead.status,
    hasConsentSnapshot: snapshot !== undefined,
    consentVersionCounselApproved: Boolean(snapshot?.counselApprovedAt),
    hasConsentCertificate: Boolean(snapshot?.snapshot.trustedFormCertUrl),
    suppressed: lead.status === "suppressed",
  });

  return { lead, consent: snapshot, source, campaign, blockers };
}

/**
 * Leads that pass every compliance gate, for CSV export (manual trial sales in Phase 0).
 * Leads with any sellability blocker are never exported (CLAUDE.md rule 4).
 */
export async function sellableLeadsForExport(db: Db, limit = 1000) {
  const rows = await db
    .select({
      lead: leads,
      consentedAt: consentSnapshots.consentedAt,
      trustedFormCertUrl: consentSnapshots.trustedFormCertUrl,
      counselApprovedAt: consentVersions.counselApprovedAt,
    })
    .from(leads)
    .innerJoin(consentSnapshots, eq(consentSnapshots.leadId, leads.id))
    .innerJoin(consentVersions, eq(consentSnapshots.consentVersionId, consentVersions.id))
    .where(inArray(leads.status, ["received", "ready"]))
    .orderBy(desc(leads.createdAt))
    .limit(limit);
  return rows.filter(
    (row) =>
      sellabilityBlockers({
        status: row.lead.status,
        hasConsentSnapshot: true,
        consentVersionCounselApproved: row.counselApprovedAt !== null,
        hasConsentCertificate: row.trustedFormCertUrl !== null,
        suppressed: false,
      }).length === 0,
  );
}
