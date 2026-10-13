/**
 * Compliance gate: reasons a lead may NOT be sold (CLAUDE.md rule 4, PLAN.md §3).
 * An empty array means no compliance blocker was found. Buyer-specific checks
 * (licenses, filters, caps) are separate and come with the distribution engine.
 */
export type SellabilityBlocker =
  | "no_consent_snapshot"
  | "consent_not_counsel_approved"
  | "missing_consent_certificate"
  | "suppressed"
  | "rejected";

export interface SellabilityInput {
  status: string;
  hasConsentSnapshot: boolean;
  consentVersionCounselApproved: boolean;
  hasConsentCertificate: boolean;
  suppressed: boolean;
}

export function sellabilityBlockers(input: SellabilityInput): SellabilityBlocker[] {
  const blockers: SellabilityBlocker[] = [];
  if (!input.hasConsentSnapshot) blockers.push("no_consent_snapshot");
  if (!input.consentVersionCounselApproved) blockers.push("consent_not_counsel_approved");
  if (!input.hasConsentCertificate) blockers.push("missing_consent_certificate");
  if (input.suppressed) blockers.push("suppressed");
  if (input.status === "rejected") blockers.push("rejected");
  return blockers;
}
