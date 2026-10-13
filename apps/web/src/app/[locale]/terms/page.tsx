import { LegalPending } from "@/components/LegalPending";
import { resolveLocale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const t = getMessages(await resolveLocale(params));
  return <LegalPending title={t.legalPending.termsTitle} t={t} />;
}
