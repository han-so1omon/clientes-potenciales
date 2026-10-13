import { PROSPECT_STAGE_LABELS, PROSPECT_STAGES, PROSPECT_TYPE_LABELS } from "@cp/core";
import { getProspect } from "@cp/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { outreachEnv } from "@/lib/env";
import { lineTitle } from "@/lib/lineLabels";
import {
  addNoteAction,
  setDoNotContactAction,
  setFollowUpAction,
  setStageAction,
  updateProspectAction,
} from "../actions";
import { ProspectForm } from "../ProspectForm";
import { OutreachComposer } from "./OutreachComposer";

const ACTIVITY_LABELS: Record<string, string> = {
  created: "Added",
  imported: "Imported",
  note: "Note",
  call: "Call",
  email_sent: "Email",
  stage_change: "Stage",
  do_not_contact: "Contact preference",
  trial: "Trial",
};

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await getProspect(getDb(), id);
  if (!detail) notFound();
  const { prospect, activities, emailsSent } = detail;
  const env = outreachEnv();
  const card = "rounded bg-white p-4 shadow-sm";
  const control = "rounded border-2 border-gray-300 px-2 py-1";

  return (
    <div className="space-y-5">
      <Link href="/admin/prospects" className="text-brand underline">
        ← Buyer finder
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{prospect.name}</h1>
        <p className="text-gray-700">
          {[prospect.company, PROSPECT_TYPE_LABELS[prospect.type], prospect.city, prospect.state]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="text-gray-700">
          {prospect.email && (
            <a className="text-brand underline" href={`mailto:${prospect.email}`}>
              {prospect.email}
            </a>
          )}
          {prospect.phone && ` · ${prospect.phone}`}
          {prospect.npn && ` · NPN ${prospect.npn}`}
        </p>
        <p className="text-gray-700">
          Licensed in: {prospect.licensedStates.join(", ") || "—"} · Sells:{" "}
          {prospect.lines.map(lineTitle).join(", ") || "—"} · Languages:{" "}
          {prospect.languages.join(", ").toUpperCase() || "—"}
        </p>
      </div>

      <section className={`${card} flex flex-wrap items-end gap-6`}>
        {/* Keyed by the saved value so the control resets when the data changes. */}
        <form
          key={`stage-${prospect.stage}`}
          action={setStageAction}
          className="flex items-end gap-2"
        >
          <input type="hidden" name="id" value={prospect.id} />
          <label>
            <span className="block text-sm font-semibold">Stage</span>
            <select name="stage" defaultValue={prospect.stage} className={control}>
              {PROSPECT_STAGES.map((s) => (
                <option key={s} value={s}>
                  {PROSPECT_STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="rounded bg-gray-900 px-3 py-1 font-semibold text-white">
            Update stage
          </button>
        </form>
        <form
          key={`follow-up-${prospect.nextFollowUpOn}`}
          action={setFollowUpAction}
          className="flex items-end gap-2"
        >
          <input type="hidden" name="id" value={prospect.id} />
          <label>
            <span className="block text-sm font-semibold">Next follow-up</span>
            <input
              type="date"
              name="nextFollowUpOn"
              defaultValue={prospect.nextFollowUpOn ?? ""}
              className={control}
            />
          </label>
          <button type="submit" className="rounded bg-gray-900 px-3 py-1 font-semibold text-white">
            Set date
          </button>
        </form>
        <form action={setDoNotContactAction}>
          <input type="hidden" name="id" value={prospect.id} />
          <input
            type="hidden"
            name="doNotContact"
            value={prospect.doNotContact ? "false" : "true"}
          />
          <button
            type="submit"
            className={`rounded px-3 py-1 font-semibold ${prospect.doNotContact ? "border-2 border-gray-400" : "bg-red-700 text-white"}`}
          >
            {prospect.doNotContact ? "Allow contact again" : "Mark do not contact"}
          </button>
        </form>
      </section>

      <section className={card}>
        <h2 className="mb-2 text-lg font-bold">Outreach email</h2>
        {prospect.doNotContact ? (
          <p className="font-semibold text-red-700">
            This prospect asked not to be contacted. Outreach is turned off.
          </p>
        ) : (
          <OutreachComposer
            prospectId={prospect.id}
            email={prospect.email}
            defaultLanguage={
              prospect.languages.length === 1 && prospect.languages[0] === "es" ? "es" : "en"
            }
            touch={emailsSent + 1}
            aiEnabled={Boolean(env.ANTHROPIC_API_KEY)}
            missingSettings={env.missing}
          />
        )}
      </section>

      <section className={card}>
        <h2 className="mb-2 text-lg font-bold">Activity</h2>
        <form action={addNoteAction} className="mb-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={prospect.id} />
          <select name="type" className={control} aria-label="Activity type">
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="trial">Trial leads sent</option>
          </select>
          <input
            name="summary"
            required
            placeholder="What happened?"
            className={`${control} min-w-64 flex-1`}
            aria-label="Summary"
          />
          <button type="submit" className="rounded bg-gray-900 px-3 py-1 font-semibold text-white">
            Add
          </button>
        </form>
        <ol className="space-y-2">
          {activities.map((a) => (
            <li key={a.id} className="border-l-4 border-gray-300 pl-3">
              <div className="text-sm text-gray-600">
                {a.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })} ·{" "}
                {ACTIVITY_LABELS[a.type] ?? a.type}
              </div>
              <div className="whitespace-pre-wrap">{a.summary}</div>
            </li>
          ))}
        </ol>
      </section>

      <details className={card}>
        <summary className="cursor-pointer text-lg font-bold">Edit details</summary>
        <div className="mt-3">
          <ProspectForm
            action={updateProspectAction}
            initial={prospect}
            submitLabel="Save changes"
          />
        </div>
      </details>
    </div>
  );
}
