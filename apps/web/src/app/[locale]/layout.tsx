import Link from "next/link";
import type { ReactNode } from "react";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import "../globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getMessages(locale);
  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-300 bg-gray-50 px-4 py-6 text-base text-gray-700">
          <div className="mx-auto max-w-3xl space-y-3">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              <Link className="underline" href={`/${locale}/privacy`}>
                {t.footer.privacy}
              </Link>
              <Link className="underline" href={`/${locale}/terms`}>
                {t.footer.terms}
              </Link>
              <Link className="underline" href={`/${locale}/partners`}>
                {t.footer.partners}
              </Link>
              <Link className="underline" href={`/${locale}/opt-out`}>
                {t.footer.optOut}
              </Link>
            </nav>
            <p>{t.footer.disclaimer}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
