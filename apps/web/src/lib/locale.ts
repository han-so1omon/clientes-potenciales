import { isLanguage, type Language } from "@cp/core";
import { notFound } from "next/navigation";

/** Validates the [locale] route segment; unknown locales are a 404. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Language> {
  const { locale } = await params;
  if (!isLanguage(locale)) notFound();
  return locale;
}
