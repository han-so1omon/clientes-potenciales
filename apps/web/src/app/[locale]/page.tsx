import { LINE_CATALOG } from "@cp/core";
import { listEnabledLines } from "@cp/db";
import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getMessages(await resolveLocale(params));
  return { title: t.home.metaTitle };
}

/** Lists the product lines the admin has switched on. */
export default async function HomePage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const t = getMessages(locale);
  const lines = await listEnabledLines(getDb());
  const otherLocale = locale === "en" ? "es" : "en";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex justify-end">
        <Link
          href={`/${otherLocale}`}
          hrefLang={otherLocale}
          lang={otherLocale}
          className="rounded-lg border-2 border-brand px-4 py-2 font-semibold text-brand"
        >
          {t.switchLanguage}
        </Link>
      </div>
      <h1 className="mt-4 text-4xl font-bold leading-tight">{t.home.headline}</h1>
      <p className="mt-4 text-xl">{t.home.subhead}</p>
      {lines.length === 0 ? (
        <p className="mt-8">{t.home.none}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {lines.map((line) => (
            <li key={line}>
              <Link
                href={`/${locale}/${LINE_CATALOG[line].slug}`}
                className="block h-full rounded-xl border-2 border-gray-200 p-5 hover:border-brand"
              >
                <span className="block text-xl font-bold text-brand">{t.lines[line].title}</span>
                <span className="mt-2 block">{t.lines[line].headline}</span>
                <span className="mt-3 block font-semibold underline">{t.home.learnMore}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
