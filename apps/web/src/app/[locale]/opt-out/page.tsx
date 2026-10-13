import type { Metadata } from "next";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";
import { OptOutForm } from "./OptOutForm";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = getMessages(await resolveLocale(params));
  return { title: t.optOut.metaTitle };
}

export default async function OptOutPage({ params }: { params: Params }) {
  const t = getMessages(await resolveLocale(params));
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t.optOut.headline}</h1>
      <p className="mt-4 mb-6 text-xl">{t.optOut.body}</p>
      <OptOutForm t={t} />
    </div>
  );
}
