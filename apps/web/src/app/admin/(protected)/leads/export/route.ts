import { sellableLeadsForExport, writeAudit } from "@cp/db";
import { isAdmin } from "@/lib/adminSession";
import { toCsv } from "@/lib/csv";
import { getDb } from "@/lib/db";

/** CSV of sellable leads for manual trial sales (Phase 0). Includes consent evidence. */
export async function GET(): Promise<Response> {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const db = getDb();
  const rows = await sellableLeadsForExport(db);

  const csv = toCsv(
    [
      "lead_id",
      "received_at",
      "first_name",
      "last_name",
      "phone",
      "email",
      "date_of_birth",
      "age",
      "zip",
      "state",
      "time_zone",
      "language",
      "coverage_amount",
      "best_time_to_call",
      "consented_at",
      "trustedform_cert_url",
    ],
    rows.map(({ lead, consentedAt, trustedFormCertUrl }) => [
      lead.id,
      lead.createdAt.toISOString(),
      lead.firstName,
      lead.lastName,
      lead.phoneE164,
      lead.email ?? "",
      lead.dateOfBirth,
      String(lead.ageAtSubmission),
      lead.zip,
      lead.state,
      lead.timeZone,
      lead.language,
      lead.coverageAmount,
      lead.bestTimeToCall,
      consentedAt.toISOString(),
      trustedFormCertUrl ?? "",
    ]),
  );

  await writeAudit(db, {
    actor: "owner",
    action: "leads.export_csv",
    entityType: "lead",
    details: { count: rows.length, leadIds: rows.map((r) => r.lead.id) },
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
