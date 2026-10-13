import { listRecentLeads } from "@cp/db";
import Link from "next/link";
import { getDb } from "@/lib/db";

const STATUS_STYLE: Record<string, string> = {
  received: "bg-blue-100 text-blue-900",
  ready: "bg-green-100 text-green-900",
  rejected: "bg-red-100 text-red-900",
  suppressed: "bg-gray-300 text-gray-900",
};

export default async function LeadsPage() {
  const leads = await listRecentLeads(getDb(), 200);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads (latest {leads.length})</h1>
        <a
          href="/admin/leads/export"
          className="rounded bg-brand px-4 py-2 font-semibold text-white"
        >
          Export sellable leads (CSV)
        </a>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        The export only includes leads that pass every compliance check (approved consent text,
        consent certificate, not suppressed).
      </p>
      {leads.length === 0 ? (
        <p>No leads yet.</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Received</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">State</th>
              <th className="p-2">Age</th>
              <th className="p-2">Lang</th>
              <th className="p-2">Source / campaign</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="p-2 whitespace-nowrap">
                  <Link className="text-brand underline" href={`/admin/leads/${lead.id}`}>
                    {lead.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })}
                  </Link>
                </td>
                <td className="p-2">
                  {lead.firstName} {lead.lastName}
                </td>
                <td className="p-2">{lead.phoneE164}</td>
                <td className="p-2">{lead.state}</td>
                <td className="p-2">{lead.ageAtSubmission}</td>
                <td className="p-2">{lead.language}</td>
                <td className="p-2">
                  {lead.sourceName}
                  {lead.campaignCode ? ` / ${lead.campaignCode}` : ""}
                </td>
                <td className="p-2">
                  <span className={`rounded px-2 py-0.5 ${STATUS_STYLE[lead.status] ?? ""}`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
