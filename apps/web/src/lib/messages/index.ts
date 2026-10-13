import type { Language } from "@cp/core";
import { en, type Messages } from "./en";
import { es } from "./es";

export type { Messages };

const MESSAGES: Record<Language, Messages> = { en, es };

export function getMessages(language: Language): Messages {
  return MESSAGES[language];
}
