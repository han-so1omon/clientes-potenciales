> **DRAFT — FOR ATTORNEY REVIEW. NOT LEGAL ADVICE. DO NOT USE LIVE UNTIL APPROVED.**
> Version: draft-0.1 (2026-10-13)

# Consent Disclosure — Final Expense (Spanish / Español)

- **Line:** Final expense insurance (seguro de gastos finales)
- **Language:** Spanish (`es`), neutral Latin American
- **Placement:** Same rules as the English version: next to the submit button, same size as body
  text, high contrast, not hidden.
- **English counterpart:** `consent-final-expense.en.md`
- **System use:** Loaded as a separate `ConsentVersion` (line = final_expense, language = es). Shown
  only on Spanish-language pages. Never edited in place.

## Texto de divulgación (copiar textualmente)

```text
Al hacer clic en "{{SUBMIT_BUTTON_LABEL}}", acepto que {{BRAND_NAME}} y hasta 3 agentes o agencias de seguros con licencia, o socios de mercadeo (vea la lista en {{WEBSITE_URL}}/es/partners), se comuniquen conmigo sobre seguros de gastos finales. Pueden llamarme o enviarme mensajes de texto al número de teléfono que di, y también enviarme correos electrónicos. Pueden usar tecnología automatizada y mensajes con voz grabada o artificial. Esto aplica aunque mi número esté en una lista estatal o nacional de "No Llamar". El número de teléfono que di es mío. No tengo que aceptar esto para comprar nada. Pueden aplicarse cargos por mensajes y datos. La cantidad de mensajes puede variar. Para dejar de recibir textos, responda STOP o ALTO. Para recibir ayuda, responda HELP o AYUDA. Puedo retirar mi consentimiento en cualquier momento. Acepto la Política de Privacidad ({{WEBSITE_URL}}/es/privacy) y los Términos de Uso ({{WEBSITE_URL}}/es/terms).
```

### Placeholders

| Placeholder | Meaning |
|---|---|
| `{{SUBMIT_BUTTON_LABEL}}` | The exact Spanish words on the submit button (e.g., "Ver mis opciones"). Must match the live button exactly. |
| `{{BRAND_NAME}}` | Consumer-facing brand name. |
| `{{WEBSITE_URL}}` | Site root. Partner list, privacy policy and terms must be live Spanish-language pages. |

## Drafting notes for counsel

1. **Not a literal translation.** The Spanish text is written to read naturally for Spanish speakers
   in the U.S. (neutral Latin American usage), while keeping every substantive element of the English
   version: who may contact (brand + up to 3 licensed agents/agencies or marketing partners + list
   link), topic (final expense), channels (calls, texts, email), automated technology and
   prerecorded/artificial voice, Do Not Call override, phone ownership, not a condition of purchase,
   message/data rates, frequency, STOP/HELP, revocation, privacy policy and terms.
2. **Terminology choices** (please confirm):
   - "seguro de gastos finales" — the term commonly used in the U.S. Hispanic final expense market.
   - "voz grabada o artificial" for "prerecorded or artificial voice."
   - "tecnología automatizada" for "automated technology."
   - "lista de 'No Llamar'" for Do Not Call list.
   - "socios de mercadeo" for "marketing partners" ("mercadeo" is widely understood in the U.S.
     Hispanic market; "marketing" is an alternative). See the English notes, item 3, about
     whether this category should be removed.
   - Mixed voice: the consent is in the first person ("acepto") and instructions are in the
     formal "usted" imperative ("responda"), mirroring the English.
3. **Keywords.** STOP and HELP are kept because carriers process them; ALTO and AYUDA are added.
   Our system must treat ALTO, PARAR, CANCELAR, BAJA and similar Spanish words as opt-outs.
   Please confirm the list of words we must honor.
4. **Language equivalence.** Questions for counsel:
   - Is consent captured in Spanish on a Spanish page valid on the same terms as English consent
     under the TCPA, FTSA and E-SIGN?
   - Must the linked partner list, privacy policy and terms also be in Spanish (we plan to provide
     them in Spanish)?
   - If a buyer's agent then calls in English, is there any issue? Should buyers be required to offer
     Spanish-speaking agents for Spanish leads (our routing can filter by language)?
5. **URL slugs.** Spanish pages use the same slugs as English with an `/es/` prefix
   (`/es/partners`, `/es/privacy`, `/es/terms`, `/es/opt-out`) for consistency with the opt-out page.
   Spanish slugs (e.g., `/es/privacidad`) can be used instead if preferred.
6. All other notes in the English file apply equally here.
