import { getActiveConsentVersion } from "@cp/db";
import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { trustedFormEnabled } from "@/lib/env";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { LeadForm } from "./LeadForm";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string }>;
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
  return { title: t.finalExpense.metaTitle };
}

export default async function FinalExpensePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const locale = await resolveLocale(params);
  const t = getMessages(locale);
  const query = await searchParams;
  const consent = await getActiveConsentVersion(getDb(), "final_expense", locale);

  const tracking: Record<string, string> = {};
  for (const [param, field] of Object.entries(TRACKING_PARAMS)) {
    const value = query[param];
    if (typeof value === "string" && value) tracking[field] = value.slice(0, 200);
  }
  const otherLocale = locale === "en" ? "es" : "en";
  const switchQuery = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => typeof e[1] === "string"),
  ).toString();

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
            href={`/${otherLocale}/final-expense${switchQuery ? `?${switchQuery}` : ""}`}
            hrefLang={otherLocale}
            lang={otherLocale}
            className="rounded-lg border-2 border-brand px-4 py-2 font-semibold text-brand"
          >
            {t.switchLanguage}
          </Link>
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight">{t.finalExpense.headline}</h1>
        <p className="mt-4 text-xl">{t.finalExpense.subhead}</p>
        <ul className="mt-4 list-disc space-y-1 pl-6 text-lg">
          {t.finalExpense.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <section className="mt-8 rounded-xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold">{t.finalExpense.formTitle}</h2>
          {consent ? (
            <LeadForm
              t={t}
              language={locale}
              consentVersionId={consent.id}
              consentText={consent.text}
              tracking={tracking}
              trustedFormEnabled={trustedFormEnabled}
            />
          ) : (
            <p role="alert">{t.errors.form}</p>
          )}
        </section>
      </div>
    </>
  );
}
