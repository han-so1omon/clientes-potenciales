import { getLeadDetail } from "@cp/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { interestLabel, lineTitle } from "@/lib/lineLabels";

const BLOCKER_LABELS: Record<string, string> = {
  no_consent_snapshot: "No consent record",
  consent_not_counsel_approved: "Consent text not yet approved by counsel",
  missing_consent_certificate: "No TrustedForm certificate",
  suppressed: "Consumer is on the suppression list",
  rejected: "Lead was rejected",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b py-2">
      <dt className="font-semibold text-gray-700">{label}</dt>
      <dd className="col-span-2 break-words">{children ?? "—"}</dd>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await getLeadDetail(getDb(), id);
  if (!detail) notFound();
  const { lead, consent, source, campaign, blockers } = detail;

  return (
    <div className="space-y-6">
      <Link href="/admin/leads" className="text-brand underline">
        ← All leads
      </Link>
      <h1 className="text-2xl font-bold">
        {lead.firstName} {lead.lastName}
      </h1>

      <section
        className={`rounded p-4 ${blockers.length ? "bg-amber-100 text-amber-950" : "bg-green-100 text-green-950"}`}
      >
        {blockers.length === 0 ? (
          <p className="font-semibold">Sellable: passes all compliance checks.</p>
        ) : (
          <>
            <p className="font-semibold">Not sellable:</p>
            <ul className="list-disc pl-6">
              {blockers.map((b) => (
                <li key={b}>{BLOCKER_LABELS[b] ?? b}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Lead</h2>
        <dl>
          <Row label="Status">
            {lead.status}
            {lead.statusReason ? ` (${lead.statusReason})` : ""}
          </Row>
          <Row label="Phone">{lead.phoneE164}</Row>
          <Row label="Email">{lead.email}</Row>
          <Row label="Date of birth">
            {lead.dateOfBirth} (age {lead.ageAtSubmission})
          </Row>
          <Row label="Location">
            {lead.zip}, {lead.state} ({lead.timeZone})
          </Row>
          <Row label="Language">{lead.language}</Row>
          <Row label="Product">{lineTitle(lead.line)}</Row>
          <Row label="Answer">{interestLabel(lead.line, lead.interest)}</Row>
          <Row label="Best time to call">{lead.bestTimeToCall}</Row>
          <Row label="Source">{source?.name}</Row>
          <Row label="Campaign">{campaign ? `${campaign.name} (${campaign.code})` : undefined}</Row>
          <Row label="UTM">{JSON.stringify(lead.utm)}</Row>
          <Row label="Form fill time">
            {lead.formFillSeconds !== null ? `${lead.formFillSeconds}s` : undefined}
          </Row>
          <Row label="Received">{lead.createdAt.toISOString()}</Row>
        </dl>
      </section>

      <section className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Consent record (immutable)</h2>
        {consent ? (
          <dl>
            <Row label="Consented at">{consent.snapshot.consentedAt.toISOString()}</Row>
            <Row label="Consent version">
              v{consent.versionNumber} ({consent.snapshot.language}) —{" "}
              {consent.counselApprovedAt ? "counsel approved" : "DRAFT, not approved"}
            </Row>
            <Row label="TrustedForm">
              {consent.snapshot.trustedFormCertUrl ? (
                <a
                  className="text-brand underline"
                  href={consent.snapshot.trustedFormCertUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {consent.snapshot.trustedFormCertUrl}
                </a>
              ) : undefined}
            </Row>
            <Row label="IP address">{consent.snapshot.ipAddress}</Row>
            <Row label="User agent">{consent.snapshot.userAgent}</Row>
            <Row label="Page URL">{consent.snapshot.pageUrl}</Row>
            <Row label="Text shown">
              <span className="whitespace-pre-wrap">{consent.snapshot.renderedText}</span>
            </Row>
          </dl>
        ) : (
          <p>No consent record.</p>
        )}
      </section>
    </div>
  );
}
