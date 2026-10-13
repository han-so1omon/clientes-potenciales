import { type Language, LINE_CATALOG, LINES, type Line } from "@cp/core";

/**
 * DRAFT consent disclosure templates pending attorney review (docs/legal/consent-*.md).
 * {{PRODUCT}} is replaced with the line's product name (LINE_CATALOG names).
 * Seeded as version 1 with no counsel approval, so leads captured with them cannot be sold.
 * After approval, add a NEW version with the approved text — never edit an existing one.
 * The quoted button label must match the landing page submit button exactly (tested).
 */
export const DRAFT_CONSENT_TEMPLATES: Record<Language, string> = {
  en: 'By clicking "See My Options," I agree that [BRAND NAME] and up to 3 licensed insurance agents, agencies, or marketing partners (see the list at /en/partners) may contact me about {{PRODUCT}}. They may call me or send text messages to the phone number I gave, and may email me. They may use automated technology and prerecorded or artificial voice messages. This is OK even if my number is on a state or national Do Not Call list. The phone number I gave is mine. I do not have to agree to this to buy anything. Message and data rates may apply. Message frequency varies. Reply STOP to stop texts, or HELP for help. I can take back my consent at any time. I agree to the Privacy Policy (/en/privacy) and Terms of Use (/en/terms).',
  es: 'Al hacer clic en "Ver mis opciones", acepto que [BRAND NAME] y hasta 3 agentes o agencias de seguros con licencia, o socios de mercadeo (vea la lista en /es/partners), se comuniquen conmigo sobre {{PRODUCT}}. Pueden llamarme o enviarme mensajes de texto al número de teléfono que di, y también enviarme correos electrónicos. Pueden usar tecnología automatizada y mensajes con voz grabada o artificial. Esto aplica aunque mi número esté en una lista estatal o nacional de "No Llamar". El número de teléfono que di es mío. No tengo que aceptar esto para comprar nada. Pueden aplicarse cargos por mensajes y datos. La cantidad de mensajes puede variar. Para dejar de recibir textos, responda STOP o ALTO. Para recibir ayuda, responda HELP o AYUDA. Puedo retirar mi consentimiento en cualquier momento. Acepto la Política de Privacidad (/es/privacy) y los Términos de Uso (/es/terms).',
};

export function draftConsentText(line: Line, language: Language): string {
  return DRAFT_CONSENT_TEMPLATES[language].replace(
    "{{PRODUCT}}",
    LINE_CATALOG[line].names[language],
  );
}

export const DRAFT_CONSENT: ReadonlyArray<{ line: Line; language: Language; text: string }> =
  LINES.flatMap((line) =>
    (["en", "es"] as const).map((language) => ({
      line,
      language,
      text: draftConsentText(line, language),
    })),
  );
