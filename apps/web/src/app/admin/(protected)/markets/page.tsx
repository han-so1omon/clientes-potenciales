import { LINE_CATALOG } from "@cp/core";
import { consentStatusByLine, listLineSettings, listServiceStates } from "@cp/db";
import { getDb } from "@/lib/db";
import { lineTitle } from "@/lib/lineLabels";
import { LineSettingsForm } from "./LineSettingsForm";
import { StatesForm } from "./StatesForm";

function ConsentBadge({ status }: { status: { version: number; approved: boolean } | undefined }) {
  if (!status) return <span className="rounded bg-red-100 px-2 text-red-900">missing</span>;
  return status.approved ? (
    <span className="rounded bg-green-100 px-2 text-green-900">v{status.version} approved</span>
  ) : (
    <span className="rounded bg-amber-100 px-2 text-amber-900">v{status.version} draft</span>
  );
}

/** Admin control of which products and states are open for leads (PLAN.md §4.7). */
export default async function MarketsPage() {
  const db = getDb();
  const [lines, states, consent] = await Promise.all([
    listLineSettings(db),
    listServiceStates(db),
    consentStatusByLine(db),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="mt-1 text-sm text-gray-600">
          Switched-on products get public landing pages and appear on the home page. Leads stay
          unsellable until that product&apos;s consent text is approved by counsel.
        </p>
        <ul className="mt-4 space-y-3">
          {lines.map((settings) => {
            const def = LINE_CATALOG[settings.line];
            return (
              <li key={settings.line} className="rounded bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-bold">{lineTitle(settings.line)}</h2>
                  <div className="flex gap-3 text-sm">
                    <span>
                      EN consent: <ConsentBadge status={consent(settings.line, "en")} />
                    </span>
                    <span>
                      ES consent: <ConsentBadge status={consent(settings.line, "es")} />
                    </span>
                  </div>
                </div>
                {def.extraLegalReview && (
                  <p className="mt-1 text-sm font-semibold text-red-800">
                    Extra regulation (Medicare marketing rules): get counsel sign-off before turning
                    this on.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <LineSettingsForm {...settings} />
                  {settings.enabled && (
                    <span className="text-sm">
                      Pages:{" "}
                      <a
                        className="text-brand underline"
                        href={`/en/${def.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /en/{def.slug}
                      </a>{" "}
                      ·{" "}
                      <a
                        className="text-brand underline"
                        href={`/es/${def.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        /es/{def.slug}
                      </a>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">States</h2>
        <p className="mt-1 mb-3 text-sm text-gray-600">
          Leads from switched-off states are turned away at the form and not stored.
        </p>
        <div className="rounded bg-white p-4 shadow-sm">
          <StatesForm states={states} />
        </div>
      </section>
    </div>
  );
}
