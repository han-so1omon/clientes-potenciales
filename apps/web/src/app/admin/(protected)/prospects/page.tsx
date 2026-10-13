import {
  isFollowUpDue,
  LINES,
  PROSPECT_STAGE_LABELS,
  PROSPECT_STAGES,
  PROSPECT_TYPE_LABELS,
  US_STATES,
} from "@cp/core";
import { listProspects, pipelineCounts } from "@cp/db";
import Link from "next/link";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { lineTitle } from "@/lib/lineLabels";

const filterSchema = z.object({
  stage: z.enum(PROSPECT_STAGES).optional().catch(undefined),
  state: z.enum(US_STATES).optional().catch(undefined),
  line: z.enum(LINES).optional().catch(undefined),
  due: z.literal("1").optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
});

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = filterSchema.parse(await searchParams);
  const db = getDb();
  const today = new Date();
  const [prospects, counts] = await Promise.all([
    listProspects(
      db,
      {
        stage: filters.stage,
        state: filters.state,
        line: filters.line,
        followUpDue: filters.due === "1",
        search: filters.q || undefined,
      },
      today,
    ),
    pipelineCounts(db),
  ]);
  const select = "rounded border-2 border-gray-300 px-2 py-1";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Buyer finder</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/prospects/import"
            className="rounded border-2 border-brand px-4 py-2 font-semibold text-brand"
          >
            Import CSV
          </Link>
          <Link
            href="/admin/prospects/new"
            className="rounded bg-brand px-4 py-2 font-semibold text-white"
          >
            Add prospect
          </Link>
        </div>
      </div>

      <nav aria-label="Pipeline" className="flex flex-wrap gap-2">
        <Link
          href="/admin/prospects"
          className={`rounded-full px-3 py-1 ${!filters.stage ? "bg-gray-900 text-white" : "bg-white"}`}
        >
          All
        </Link>
        {PROSPECT_STAGES.map((stage) => (
          <Link
            key={stage}
            href={`/admin/prospects?stage=${stage}`}
            className={`rounded-full px-3 py-1 ${filters.stage === stage ? "bg-gray-900 text-white" : "bg-white"}`}
          >
            {PROSPECT_STAGE_LABELS[stage]} ({counts[stage]})
          </Link>
        ))}
      </nav>

      <form className="flex flex-wrap items-end gap-3 rounded bg-white p-3 shadow-sm" method="get">
        {filters.stage && <input type="hidden" name="stage" value={filters.stage} />}
        <label>
          <span className="block text-sm font-semibold">Search</span>
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Name, company, email"
            className={select}
          />
        </label>
        <label>
          <span className="block text-sm font-semibold">Licensed in</span>
          <select name="state" defaultValue={filters.state ?? ""} className={select}>
            <option value="">Any state</option>
            {US_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-sm font-semibold">Sells</span>
          <select name="line" defaultValue={filters.line ?? ""} className={select}>
            <option value="">Any product</option>
            {LINES.map((line) => (
              <option key={line} value={line}>
                {lineTitle(line)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-1">
          <input type="checkbox" name="due" value="1" defaultChecked={filters.due === "1"} />
          Follow-up due
        </label>
        <button type="submit" className="rounded bg-gray-900 px-3 py-1 font-semibold text-white">
          Filter
        </button>
      </form>

      {prospects.length === 0 ? (
        <p>No prospects match. Add one or import a CSV list.</p>
      ) : (
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Type</th>
              <th className="p-2">Licensed in</th>
              <th className="p-2">Products</th>
              <th className="p-2">Stage</th>
              <th className="p-2">Next follow-up</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <Link
                    className="font-semibold text-brand underline"
                    href={`/admin/prospects/${p.id}`}
                  >
                    {p.name}
                  </Link>
                  {p.company && <div className="text-gray-600">{p.company}</div>}
                  {p.doNotContact && (
                    <div className="font-semibold text-red-700">Do not contact</div>
                  )}
                </td>
                <td className="p-2">{PROSPECT_TYPE_LABELS[p.type]}</td>
                <td className="p-2">{p.licensedStates.join(", ")}</td>
                <td className="p-2">{p.lines.map(lineTitle).join(", ")}</td>
                <td className="p-2">{PROSPECT_STAGE_LABELS[p.stage]}</td>
                <td
                  className={`p-2 ${isFollowUpDue(p.nextFollowUpOn, today) ? "font-semibold text-red-700" : ""}`}
                >
                  {p.nextFollowUpOn ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
