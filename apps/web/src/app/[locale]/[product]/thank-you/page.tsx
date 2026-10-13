import type { Metadata } from "next";
import Link from "next/link";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { resolveEnabledLine } from "@/lib/product";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; product: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getMessages(await resolveLocale(params));
  return { title: t.thankYou.metaTitle };
}

export default async function ThankYouPage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  await resolveEnabledLine(params);
  const t = getMessages(locale);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold">{t.thankYou.headline}</h1>
      <p className="mt-4 text-xl">{t.thankYou.body}</p>
      <p className="mt-6">
        {t.thankYou.note}{" "}
        <Link className="underline" href={`/${locale}/opt-out`}>
          {t.thankYou.optOutLink}
        </Link>
      </p>
    </div>
  );
}
