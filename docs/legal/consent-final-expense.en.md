> **DRAFT — FOR ATTORNEY REVIEW. NOT LEGAL ADVICE. DO NOT USE LIVE UNTIL APPROVED.**
> Version: draft-0.1 (2026-10-13)

# Consent Disclosure — Final Expense (English)

- **Line:** Final expense insurance
- **Language:** English (`en`)
- **Placement:** Directly above or next to the form's submit button, in the same font size as the
  form text (never smaller than the body text), high contrast, not hidden behind a link or scroll box.
- **Spanish counterpart:** `consent-final-expense.es.md` (must stay substantively equivalent).
- **System use:** Once approved, this text is loaded as a new `ConsentVersion` row
  (line = final_expense, language = en) with `counsel_approved_at` set. It is never edited in place;
  any change creates a new version (CLAUDE.md rule 11).

## Disclosure text (copy verbatim)

```text
By clicking "{{SUBMIT_BUTTON_LABEL}}," I agree that {{BRAND_NAME}} and up to 3 licensed insurance agents, agencies, or marketing partners (see the list at {{WEBSITE_URL}}/en/partners) may contact me about final expense insurance. They may call me or send text messages to the phone number I gave, and may email me. They may use automated technology and prerecorded or artificial voice messages. This is OK even if my number is on a state or national Do Not Call list. The phone number I gave is mine. I do not have to agree to this to buy anything. Message and data rates may apply. Message frequency varies. Reply STOP to stop texts, or HELP for help. I can take back my consent at any time. I agree to the Privacy Policy ({{WEBSITE_URL}}/en/privacy) and Terms of Use ({{WEBSITE_URL}}/en/terms).
```

### Placeholders used

| Placeholder | Meaning |
|---|---|
| `{{SUBMIT_BUTTON_LABEL}}` | The exact words on the submit button (e.g., "See My Options"). Must match the live button character-for-character. |
| `{{BRAND_NAME}}` | Consumer-facing brand name. |
| `{{WEBSITE_URL}}` | Site root, e.g., `https://example.com`. The partner list, privacy policy and terms must be live, clickable links. |

## Drafting notes for counsel

1. **Goal.** Prior express written consent (PEWC) under the TCPA and its implementing rule
   (47 C.F.R. § 64.1200(f)(9)), plus E-SIGN-compliant electronic signature via the button click,
   and the analogous consent standard under the Florida Telephone Solicitation Act (FTSA) and other
   Southeast state laws. Please confirm the text satisfies each.
2. **Reading level.** Written in short sentences to target roughly a 6th–8th grade reading level for
   a 60+ audience. Please flag any term that must be kept even if it raises reading difficulty
   (e.g., "artificial voice," "automated technology").
3. **Seller identification / one-to-one consent.** The draft names {{BRAND_NAME}} and "up to 3
   licensed insurance agents, agencies, or marketing partners" with a link to a list. Our
   understanding is that the FCC's 2023 "one-to-one consent" rule was vacated by the Eleventh Circuit
   in early 2025 (*Insurance Marketing Coalition v. FCC*), but we ask counsel to confirm the current
   status and whether:
   - a linked list is sufficient, or buyers must be named on the face of the form;
   - the list may name **categories** of buyers, or must name each company;
   - the list must be frozen at the time of consent (our system snapshots the list into the
     `ConsentSnapshot`);
   - "marketing partners" is acceptable, or should be removed so that only licensed agents/agencies
     can call (our business model only sells to licensed buyers; removing it may be simpler and safer).
4. **Topic scope.** Consent is limited to "final expense insurance." Buyers may not use it to market
   other products. Confirm whether this narrower scope is advisable versus "life insurance."
5. **Automated technology wording.** We say "automated technology" rather than "autodialer" or
   "ATDS" because of the post-*Facebook v. Duguid* definition and state laws (e.g., FTSA's
   "automated system for the selection or dialing" language). Confirm wording covers FTSA.
6. **Not a condition of purchase.** Stated as "I do not have to agree to this to buy anything."
   Confirm this plain-language version is adequate. Should we offer an alternative path (e.g.,
   "You can also call us at {{CONTACT_PHONE}}") for consumers who do not want to consent?
7. **Revocation.** The FCC's 2024 revocation rules require honoring revocation made by any
   reasonable means. Our system will treat STOP, ALTO, PARAR, CANCEL, END, QUIT, UNSUBSCRIBE,
   REVOKE, OPT OUT (and Spanish equivalents) as opt-outs, plus phone, email and web requests at
   `{{WEBSITE_URL}}/en/opt-out`. Please confirm the current effective date and scope of the
   "revoke-all" provision and the required honoring time frame.
8. **Subscriber statement.** "The phone number I gave is mine" is included to address
   reassigned/wrong-number risk. Confirm whether to expand to "I am the subscriber or customary user."
9. **Checkbox vs. button.** Should consent be a separate, unchecked checkbox (with the form still
   submittable without it) rather than click-to-submit? This affects whether consent is
   "not a condition" in practice.
10. **SMS program terms.** Includes "Message and data rates may apply," "Message frequency varies,"
    STOP and HELP. Confirm whether additional carrier/CTIA disclosures are needed for the SMS
    registration (10DLC campaign brief).
11. **Medicare.** This text is for final expense only. Medicare lines will need separate
    consent versions reviewed under CMS TPMO rules (see README questions).
