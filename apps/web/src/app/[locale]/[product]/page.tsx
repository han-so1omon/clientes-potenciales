import { LINE_CATALOG } from "@cp/core";
import { getActiveConsentVersion, listEnabledLines } from "@cp/db";
import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { trustedFormEnabled } from "@/lib/env";
import { fill } from "@/lib/format";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { resolveEnabledLine } from "@/lib/product";
import { LeadForm } from "./LeadForm";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; product: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Query-string parameters carried into the lead for source attribution. */
const TRACKING_PARAMS: Record<string, string> = {
  c: "campaignCode",
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getMessages(await resolveLocale(params));
  const { line } = await resolveEnabledLine(params);
  return { title: t.lines[line].title };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const locale = await resolveLocale(params);
  const { line, settings } = await resolveEnabledLine(params);
  const t = getMessages(locale);
  const copy = t.lines[line];
  const query = await searchParams;
  const db = getDb();
  const consent = await getActiveConsentVersion(db, line, locale);
  const otherLines = (await listEnabledLines(db)).filter((other) => other !== line);

  const tracking: Record<string, string> = {};
  for (const [param, field] of Object.entries(TRACKING_PARAMS)) {
    const value = query[param];
    if (typeof value === "string" && value) tracking[field] = value.slice(0, 200);
  }
  const otherLocale = locale === "en" ? "es" : "en";
  const queryString = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => typeof e[1] === "string"),
  ).toString();
  const keepQuery = queryString ? `?${queryString}` : "";

  return (
    <>
      {consent && !consent.counselApprovedAt && (
        <div role="note" className="bg-amber-200 px-4 py-2 text-center text-base font-semibold">
          {t.draftBanner}
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex justify-end">
          <Link
            href={`/${otherLocale}/${LINE_CATALOG[line].slug}${keepQuery}`}
            hrefLang={otherLocale}
            lang={otherLocale}
            className="rounded-lg border-2 border-brand px-4 py-2 font-semibold text-brand"
          >
            {t.switchLanguage}
          </Link>
        </div>
        <p className="mt-4 text-lg font-semibold text-brand">{copy.title}</p>
        <h1 className="mt-1 text-4xl font-bold leading-tight">{copy.headline}</h1>
        <p className="mt-4 text-xl">{copy.subhead}</p>
        <ul className="mt-4 list-disc space-y-1 pl-6 text-lg">
          {[
            ...copy.points,
            t.landing.freeToTalk,
            fill(t.landing.ageRange, { min: settings.minAge, max: settings.maxAge }),
            t.landing.bilingual,
          ].map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <section className="mt-8 rounded-xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold">{t.landing.formTitle}</h2>
          {consent ? (
            <LeadForm
              t={t}
              line={line}
              minAge={settings.minAge}
              maxAge={settings.maxAge}
              language={locale}
              consentVersionId={consent.id}
              consentText={consent.text}
              tracking={tracking}
              trustedFormEnabled={trustedFormEnabled()}
            />
          ) : (
            <p role="alert">{t.errors.form}</p>
          )}
        </section>
        {otherLines.length > 0 && (
          <nav className="mt-10" aria-labelledby="other-options">
            <h2 id="other-options" className="text-xl font-bold">
              {t.landing.otherOptions}
            </h2>
            <ul className="mt-2 space-y-1">
              {otherLines.map((other) => (
                <li key={other}>
                  <Link
                    className="text-brand underline"
                    href={`/${locale}/${LINE_CATALOG[other].slug}`}
                  >
                    {t.lines[other].title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
