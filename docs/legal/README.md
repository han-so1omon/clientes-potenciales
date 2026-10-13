> **DRAFT — FOR ATTORNEY REVIEW. NOT LEGAL ADVICE. DO NOT USE LIVE UNTIL APPROVED.**
> Version: draft-0.1 (2026-10-13)

# Legal Drafts — Index and Questions for Counsel

> ## NOTICE: ALL DOCUMENTS IN THIS FOLDER ARE DRAFTS
> They were prepared by an AI assistant for review by a licensed attorney experienced in TCPA,
> telemarketing, privacy and insurance marketing law. **They are not legal advice and must not be
> published, shown to consumers, or accepted by buyers or affiliates until counsel has approved
> them.** In the system, a consent text is only usable once its `ConsentVersion` has
> `counsel_approved_at` set (see `docs/PLAN.md` §3.1 and §3.7).

## Business context (for counsel)

- The owner is **not a licensed insurance producer** (licensing is in progress).
- The business generates leads from U.S. consumers roughly 60+ in **FL, GA, AL, MS, TN, SC, NC, LA**,
  in **English and Spanish**, through hosted landing pages, online ads, affiliates (later), postal
  mailers and email.
- First line: **final expense insurance**. Medicare Supplement next; Medicare Advantage/Part D only
  after legal sign-off.
- Leads are sold for a **flat price per lead** (never a commission share or per-policy payment) to
  licensed agents, agencies and call centers as **exclusive**, **shared (up to 3 buyers)** or
  **aged (30+ days)** leads.
- Buyers prepay into a wallet; returns are allowed within 72 hours for listed reasons and credited to
  the wallet.
- Consent is captured with TrustedForm certificates and stored as immutable snapshots, including the
  exact text shown and the partner list in effect.

## Documents

| File | Document | Audience | Notes |
|---|---|---|---|
| [consent-final-expense.en.md](consent-final-expense.en.md) | Consent disclosure (EN), final expense | Consumers | Shown next to the submit button |
| [consent-final-expense.es.md](consent-final-expense.es.md) | Consent disclosure (ES), final expense | Consumers | Natural Spanish, substantively equivalent |
| [buyer-agreement.md](buyer-agreement.md) | Lead Purchase Agreement | Buyers (agents/agencies/call centers) | Accepted electronically in the buyer portal |
| [privacy-policy.en.md](privacy-policy.en.md) | Privacy Policy (EN) | Consumers | Discloses sale of leads plainly |
| [privacy-policy.es.md](privacy-policy.es.md) | Privacy Policy (ES) | Consumers | |
| [terms-of-use.en.md](terms-of-use.en.md) | Website Terms of Use (EN) | Consumers | |
| [terms-of-use.es.md](terms-of-use.es.md) | Website Terms of Use (ES) | Consumers | |
| [affiliate-requirements.md](affiliate-requirements.md) | Affiliate compliance requirements | Future affiliates (Phase 2) | Exhibit to a future Affiliate Agreement |

Not yet drafted (see PLAN.md §3.7): full Affiliate Agreement, mailer and ad templates, partner list
page, opt-out page copy, SMS program terms, buyer outreach email templates.

### Placeholders

`{{COMPANY_LEGAL_NAME}}`, `{{BRAND_NAME}}`, `{{CONTACT_EMAIL}}`, `{{CONTACT_PHONE}}`,
`{{MAILING_ADDRESS}}`, `{{WEBSITE_URL}}`, `{{STATE_OF_FORMATION}}` — company details still to be decided.
Also used: `{{SUBMIT_BUTTON_LABEL}}`, `{{EFFECTIVE_DATE}}`, `{{GOVERNING_LAW_STATE}}`,
`{{VENUE_COUNTY}}`, `{{CONSENT_RETENTION_PERIOD}}`, `{{LEAD_RETENTION_PERIOD}}`.

Bracketed **[COUNSEL: ...]** notes inside documents are questions, not document text.

---

## Questions for counsel

Items below are phrased as questions because we are not certain of the answers. Statements of our
understanding are offered only so counsel can correct them.

### A. TCPA consent (federal)

1. Does the draft consent disclosure meet the TCPA's **prior express written consent** standard
   (47 C.F.R. § 64.1200(f)(9)) for calls and texts using automated technology and
   prerecorded/artificial voice, with the button click as an E-SIGN signature?
2. Our understanding is that the FCC's 2023 **"one-to-one consent"** rule was vacated by the
   Eleventh Circuit in January 2025 (*Insurance Marketing Coalition v. FCC*). Is that correct, and is
   anything pending (rehearing, new FCC rulemaking) that would change it?
3. For **shared leads (up to 3 buyers)**: is naming buyers on a linked partner list sufficient, or must
   they be named on the face of the form? Is naming **categories** of buyers ever sufficient? How
   many names may the list contain while remaining "clear and conspicuous"?
4. Should "marketing partners" be dropped from the disclosure so only licensed agents/agencies are
   covered (our model only sells to licensed buyers)?
5. Should consent be a **separate unchecked checkbox** rather than click-to-submit?
6. What is the current status and effective date of the FCC's 2024 **revocation of consent** rules
   (any reasonable means; honoring timeline; the "revoke-all" provision)? What deadline should our
   buyer agreement impose on buyers (draft says 24 hours after a suppression notice)?
7. How long does consent remain valid for **aged leads** (30+ days, possibly months)? Is there a
   point after which aged leads should not be called/texted?
8. Does reselling an aged lead that was previously sold to 3 shared buyers exceed the scope of the
   consumer's consent ("up to 3")? Should aged sales count toward the 3-buyer limit?

### B. State telemarketing laws ("mini-TCPAs")

9. Our understanding is that **Florida's FTSA** (as amended in 2023) has its own consent definition,
   calling-hour limits (we believe 8 a.m.–8 p.m.) and call-frequency limits (we believe 3 calls per
   24 hours on the same subject), and a cure-notice provision for text messages. Please confirm and
   identify anything the consent text must add for Florida.
10. Which of the other target states (**GA, AL, MS, TN, SC, NC, LA**) have their own telephone
    solicitation laws with private rights of action, consent standards, calling-hour limits, Sunday
    or holiday restrictions, state do-not-call lists, or **telemarketer registration/bonding**
    requirements that apply to us or to buyers? (Please verify rather than rely on our list; we
    want a per-state table for our `StateRule` configuration.)
11. Does Company itself need to register as a telemarketer/commercial telephone seller in any
    state (e.g., Florida) if it does not make calls but generates leads for those who do? Does that
    change if we later send texts or emails to consumers?
12. Which target states require **all-party consent for call recording**? (We believe Florida does.)
    Does TrustedForm **session replay** on our pages raise wiretap/session-replay risk in those states,
    and what notice or consent is needed?

### C. Insurance licensing and compensation

13. In each target state, may an **unlicensed person sell final expense leads** for a flat fee?
    Does the answer change for **Medicare Supplement** and **Medicare Advantage/Part D** leads?
14. Does any target state treat lead generation, or specific activities (e.g., describing products on
    the landing page, "qualifying" questions, warm transfers), as soliciting or transacting insurance
    requiring a license?
15. Is the **flat per-lead price** (never per-policy or commission-based) sufficient to avoid
    unlicensed-compensation and anti-rebating issues in each state? Do tiered prices (by lead quality
    tier) or returns create any issue?
16. Once the owner is licensed and buys leads in his own system, what changes (disclosures, conflicts,
    appointment requirements, buyer agreement terms)?

### D. Medicare (future)

17. What are the current **CMS third-party marketing organization (TPMO)** requirements for Medicare
    Advantage/Part D leads — required TPMO disclaimer text, consent rules for sharing beneficiary
    data with other TPMOs (and the status of the 2024 rule after litigation), call recording and
    retention requirements, and restrictions during AEP/OEP?
18. Do Medicare Supplement leads carry any CMS or state-specific marketing restrictions we must
    build in?
19. What rules govern **mailers** that mention Medicare (e.g., 42 U.S.C. § 1320b-10 on misuse of
    Medicare/SSA names and symbols, 39 U.S.C. § 3001 on government look-alike mail, state rules)?
    What disclaimers are required ("not affiliated with or endorsed by the government or the federal
    Medicare program")?

### E. Spanish-language consent and documents

20. Is consent given in Spanish on a Spanish-language page fully equivalent to English consent under
    the TCPA, FTSA and E-SIGN?
21. Must every linked document (partner list, privacy policy, terms) be available in Spanish?
    Which version controls if they differ?
22. Must buyers who receive Spanish-language leads be able to communicate in Spanish? Should our
    buyer agreement require it?

### F. Privacy and data

23. Which **state comprehensive privacy laws** apply to us now or at expected scale (e.g., Tennessee
    Information Protection Act, Florida Digital Bill of Rights, and laws of states outside the
    Southeast from which consumers might still submit forms)? Do insurance/GLBA exemptions apply?
24. Are we a **"financial institution" under GLBA** or subject to state insurance information privacy
    rules (NAIC model-based) because we collect consumer information related to insurance?
25. What **retention periods** should we use for consent snapshots and certificates (we propose
    5 years), lead data, suppression records (indefinitely, hashed), and ledger/financial records?
26. Do our pixels/analytics on form pages create risk (e.g., sharing data with ad platforms), and
    must we honor **Global Privacy Control** signals?
27. Is a **data broker registration** required in any state for selling leads?

### G. Email and buyer outreach

28. Does **CAN-SPAM** apply to our B2B cold emails to agents/agencies (we assume yes), and are our
    planned controls sufficient (accurate headers, physical address, clear opt-out honored within
    10 business days, no deceptive subject lines)?
29. Are there limits on using **public state insurance-department licensee data** for outreach?
30. Any rules for marketing emails to consumers (if we later email consumers directly)?

### H. Buyer agreement and commercial terms

31. Is the **prepaid wallet** structure free of money-transmitter, stored-value and
    unclaimed-property concerns?
32. Are the **mutual indemnities** appropriately scoped (Company covers its consent capture; buyer
    covers its calling conduct)? Should Company's indemnity be capped?
33. Is the **limitation of liability** (3 months of fees, with carve-outs) reasonable and enforceable?
34. Is **electronic acceptance with versioned amendments** (15 days' notice, re-acceptance in portal)
    enforceable as drafted?
35. Governing law, venue, and whether to use arbitration — which state should we choose?
36. Should the agreement require buyers to carry **E&O or cyber insurance**?

### I. Marketing materials

37. What disclaimers are required on final expense ads and mailers (e.g., "not affiliated with any
    government agency," no "free" claims for coverage, no "official" styling)?
38. What review process should we use for ad/mailer templates before each drop?

### J. Litigation risk

39. What practices should we adopt now to reduce **serial TCPA/FTSA litigant** risk (litigator scrub,
    honeypot detection, reassigned numbers database checks, demand-letter response process)?
40. Can we obtain insurance that covers TCPA claims, and what will the insurer require?
