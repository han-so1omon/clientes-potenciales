# Clientes Potenciales — Product & Implementation Plan

Status: **Approved direction, v1.0** (2026-10-13). Update this file whenever a decision changes;
record the change in the Decision Log at the bottom.

---

## 1. Summary

A platform to **generate, verify, and sell insurance leads** for U.S. consumers aged ~50+ (core market
60+) for insurance that pays benefits **while the person is alive** (care, illness, hospital, health-cost
gaps), starting in
the **Southeast** (FL, GA, AL, MS, TN, SC, NC, LA), in **English and Spanish**.

- **Now:** sell the owner's own leads to licensed agents and agencies.
- **Later:** become licensed and work some leads directly; open a marketplace to other lead suppliers.
- **Maintained by conversational AI**, so the codebase favors simplicity, strong typing, tests, and
  configuration over code.

### Settled decisions

| # | Decision | Choice |
|---|---|---|
| D1 | Insurance lines | **Multiple "living benefit" lines for 50+**, each switched on/off by the admin (Markets page): long-term care, home health care, critical illness, hospital indemnity, life insurance with living benefits, dental/vision/hearing. Medicare Supplement available but off until counsel sign-off; final expense (burial) available but off by default. Medicare Advantage/Part D not offered |
| D2 | Landing pages | **Hosted by this platform** (full control of consent records) |
| D3 | Stack | **TypeScript** end to end (see §8) |
| D4 | Platform budget | **~$200/month** to start (excludes ad/mailer spend and legal fees) |
| D5 | Owner works leads after licensing | **Yes** — owner can be a "buyer" in their own system |
| D6 | Pricing model | **Flat price per lead. Never a share of commission or per-policy payment** (owner is unlicensed) |
| D7 | Lead products | Exclusive real-time, shared real-time (max 3 buyers), aged (30+ days). Live transfers later |
| D8 | Billing | Buyers **prepay** into a wallet (Stripe); larger accounts may be invoiced later |
| D9 | Marketplace | Designed into the data model (`supplier`), **not built** in v1 |

---

## 2. Users

| User | Needs |
|---|---|
| **Owner / admin** | See every lead and where it came from, its cost and what it sold for; manage buyers, affiliates, consent text, prices; find new buyers |
| **Buyer (agent / agency / call center)** | Receive matching leads fast, with proof of consent; control filters, caps, budget; return bad leads; see spend |
| **Affiliate (Phase 2)** | Post leads via API; see accepted/rejected counts and payouts |
| **Consumer** | Clear forms in their language; easy opt-out and data deletion |

---

## 3. Compliance requirements (built in as product features)

These are **requirements**, not suggestions. Each has automated tests (see CLAUDE.md).

### 3.1 Consent
- Every form shows a **versioned consent disclosure** (`ConsentVersion`) in the language displayed.
- On submit we store an **immutable consent snapshot**: consent version id, full rendered text,
  timestamp, IP, user agent, page URL, language, and **TrustedForm certificate URL** (Jornaya optional).
- Disclosure names the buyers (or categories) the lead may be shared with. Shared leads may only go to
  buyers within that disclosure.
- No lead is sellable without a valid consent snapshot. Affiliate leads without a certificate are rejected.

### 3.2 Contact rules (passed to buyers + enforced in delivery)
- Delivery metadata includes the consumer's **state and local time zone** (the Southeast spans
  Eastern and Central; the Florida panhandle is Central).
- State calling-hour and frequency rules (e.g., Florida FTSA) live in a **rules table**, not code.
  Buyers are reminded of them in the buyer agreement.

### 3.3 Suppression & consumer rights
- Global **suppression list** (opt-outs, deletion requests, known litigators when we add a scrub
  service). Suppressed consumers are never sold; buyers who already received them get a suppression
  notice via webhook/email.
- Public opt-out and data-request page (EN/ES). Privacy policy in EN/ES.

### 3.4 Buyer eligibility
- Buyer must accept the current **Buyer Agreement** version (stored with timestamp).
- Buyer must have a **license on file for each state** they buy in (NPN + state; manually verified in
  Phase 1). Routing never sends a lead to a buyer not licensed in the lead's state.

### 3.5 Marketing materials
- Mailers and ads must not resemble government communications (no Medicare-lookalike logos, no
  "official notice" styling). Every mailer/ad template is stored with an approval record.
- Each mailer drop gets a unique URL/QR code and tracking phone number.

### 3.6 Medicare (not in v1)
- Before any Medicare Advantage/Part D leads: counsel confirms current CMS third-party marketing
  (TPMO) rules — disclaimers, consent for sharing with each TPMO, call recording. The data model
  supports per-line consent versions so this is a configuration + rules change, not a rebuild.

### 3.7 Legal review checklist (owner action, before first sale)
- [ ] Consent disclosure (EN + ES), final expense
- [ ] Buyer Agreement (returns, exclusivity, use restrictions, compliance duties, no resale)
- [ ] Privacy policy + terms of use (EN + ES)
- [ ] Affiliate agreement (Phase 2)
- [ ] Mailer and ad templates
- [ ] Confirm that selling leads unlicensed is permitted in each target state for each line

Claude drafts all of the above for counsel to review. **None are used live until reviewed.**

---

## 4. Modules

### 4.1 Lead capture — landing pages
- One page per **enabled line × language** at `/{en|es}/{line-slug}`; `/{en|es}` lists enabled lines.
- Lines are defined in code (`LINE_CATALOG`); which are offered, their age ranges, and which states
  accept leads are **admin settings** (Admin → Markets). See `docs/runbooks/add-insurance-line.md`.
- Short form (senior-friendly: large text, high contrast, mobile-first, few fields): one qualifying
  question per line (never health questions), DOB, ZIP, name, phone, email (optional), best time to call.
- TrustedForm script on every page; consent checkbox/disclosure adjacent to submit button.
- UTM / campaign parameters captured automatically; mailer QR codes land here with the drop's code.
- Thank-you page sets expectations ("a licensed agent will call you").

### 4.2 Intake (all sources)
| Source | Mechanism |
|---|---|
| Landing pages | Direct form submission |
| Facebook / Google lead forms | Webhook → intake API (consent text must match our approved version) |
| Affiliates (Phase 2) | `POST /api/v1/leads` with API key; certificate required |
| Mailers | Unique URL/QR → landing page; call-tracking number → manual or call-log entry as `inbound_call` lead |
| Email campaigns | Links with campaign codes → landing page |
| Manual / CSV | Admin upload (must include consent evidence) |

Every lead records **source → campaign → (affiliate)**, so cost and profit roll up by source.

### 4.3 Quality pipeline
Runs as background jobs, in order. Each step writes a `ValidationResult`.
1. **Normalize** — E.164 phone, lowercase email, ZIP → state/county/time zone, DOB → age.
2. **Validate** — phone line type & active (Twilio Lookup), email syntax/MX, ZIP within allowed states,
   age within line's range, required fields per line.
3. **Fraud checks** — duplicate submissions, too-fast form fills, bot signals, IP-to-state mismatch.
4. **Compliance** — consent snapshot present and certificate valid; suppression list check.
5. **Dedupe** — same consumer (phone hash) seen within 90 days → flagged; never resold exclusive twice.
6. **Score & tier** — rule-based score (contactability + completeness + source history) → tier A/B/C.

Outcome: `ready` or `rejected` (with reason).

### 4.4 Distribution engine
Pure logic in `packages/core`, fully unit tested.

**Eligibility** for a buyer campaign: active; filters match (line, states, ZIPs/counties, age range,
language, tier); within daily/monthly caps; inside delivery schedule; wallet balance ≥ price; buyer
licensed in lead's state; buyer hasn't received this consumer in 90 days.

**Routing v1:**
1. Offer **exclusive**: highest-price eligible exclusive campaign; ties → round-robin.
2. Else **shared**: up to 3 eligible shared campaigns (highest price first, round-robin ties).
3. Else **hold** and re-offer for up to 24 hours as campaigns' caps/schedules open.
4. After 30 days unsold (or only shared once), move to **aged** inventory.

**Delivery:** webhook (JSON, signed), email, SMS alert; CRM integrations in Phase 2. Retries with
backoff; failures surface in admin. Every attempt is a `DeliveryAttempt` row.

Phase 3: ping-post (anonymized preview → bids → sale).

### 4.5 Buyer portal
- Signup → profile → **license states + NPN** → accept Buyer Agreement → fund wallet (Stripe Checkout,
  optional auto-recharge).
- Campaigns: line, geography, age, language, exclusive/shared, daily/monthly caps, schedule, delivery.
- Lead inbox: details, consent certificate link, consent text snapshot, status.
- **Returns:** within 72 hours, reason codes: disconnected/wrong number, duplicate, out of filters,
  consumer denies request, fraud. Objective reasons auto-verified (e.g., re-run phone check) and
  credited automatically; others go to admin review.
- Billing: balance, ledger history, receipts.
- Language: portal in English first; Spanish in Phase 2.

### 4.6 Buyer finder (sales CRM for finding buyers)
- **Prospects:** agencies, agents, call centers, and FMOs/IMOs. Import from CSV, public state
  insurance-department licensee data (respecting each state's terms of use), and manual entry.
- Fields: name, company, states licensed, lines, language served (flag Spanish-speaking agents),
  contact info, source, notes.
- **Pipeline:** `prospect → contacted → replied → trial sent → paying → churned`.
- **AI-drafted outreach:** Claude drafts personalized emails in English or Spanish (template fallback
  when no API key is set or the AI call fails); the owner edits in-app, sends from their own email app,
  then logs it — which moves the prospect to *Contacted* and schedules a follow-up 4 days later.
  CAN-SPAM footer (name, postal address, opt-out) appended automatically; "do not contact" blocks
  outreach. No automated sending, cold calls, or texts. See `docs/runbooks/finding-buyers.md`.
- **Trial offer:** send N free/discounted leads to a prospect, tracked as a promotional sale.
- Reports: which prospect sources turn into paying buyers.

### 4.7 Admin console
- Dashboard: leads today/this week, sold %, revenue, cost, **margin by source/campaign/affiliate**,
  return rate by source and buyer.
- Leads: search, detail with full timeline (intake → validation → offers → sales → returns).
- Sources & costs: create campaigns, mailer drops (generate QR codes/URLs), enter costs.
- Buyers: approve, verify licenses, adjust balances (via ledger adjustment with reason), pause.
- Consent versions, buyer agreement versions, state rules, prices by line/tier/product.
- Suppression list management. Audit log of every admin action.

### 4.8 Designed for later (no UI in v1)
- **Supplier** on every lead (owner = supplier #1) → marketplace = enabling more suppliers + payouts.
- **Owner as buyer:** once licensed, owner's agency is a normal buyer account; routing treats it like
  any other campaign (with an optional "first look" priority).
- **Live transfers:** `inbound_call` leads + telephony provider in Phase 3.

---

## 5. Data model (core entities)

Money is always **integer cents**. Timestamps are UTC. All tables have `id`, `created_at`, `updated_at`.

| Entity | Key fields |
|---|---|
| `Supplier` | name, type (`owner`/`external`), status |
| `Source` | supplier_id, channel (`landing_page`/`ad_platform`/`affiliate`/`mailer`/`email`/`inbound_call`/`manual`), name |
| `Campaign` | source_id, name, tracking code, line, language, start/end |
| `CostEntry` | campaign_id, amount_cents, period or per-lead, note |
| `Affiliate` | source_id, api_key_hash, payout_cents, status |
| `ConsentVersion` | line, language, version, text, buyer disclosure list, counsel_approved_at, active |
| `LandingPage` | slug, line, language, template, consent_version_id, status |
| `InsuranceLine` | key (catalog line), enabled, min_age, max_age — admin-controlled |
| `ServiceState` | state, enabled — admin-controlled |
| `Lead` | supplier_id, campaign_id, line, interest (answer to the line's question), first/last name, phone (E.164), email, dob, zip, state, county, time zone, language, status, tier, score, phone_hash |
| `ConsentSnapshot` | lead_id, consent_version_id, rendered_text, consented_at, ip, user_agent, page_url, trustedform_url, jornaya_id — **immutable** |
| `ValidationResult` | lead_id, check, provider, outcome, details (JSON) |
| `Buyer` | name, type, status, agreement_version, agreement_accepted_at |
| `BuyerUser` | buyer_id, email, role |
| `BuyerLicense` | buyer_id, state, npn, verified_at |
| `BuyerCampaign` | buyer_id, product (`exclusive`/`shared`/`aged`), filters (JSON, Zod-validated), price_cents, caps, schedule, delivery config, status |
| `Sale` | lead_id, buyer_campaign_id, product, price_cents, sold_at, promotional (bool) |
| `DeliveryAttempt` | sale_id, channel, status, response, attempted_at |
| `ReturnRequest` | sale_id, reason, evidence, status, decided_by, decided_at |
| `LedgerEntry` | buyer_id, amount_cents (+/−), type (`topup`/`sale`/`return_credit`/`adjustment`/`promo`), ref, **append-only** |
| `Suppression` | phone_hash/email_hash, reason, source, created_at |
| `StateRule` | state, rule type, value (calling hours, frequency limits, notes) |
| `BuyerProspect` | name, company, type, email, phone, NPN, licensed states, lines, languages, source, stage, next follow-up, do-not-contact, notes (unique by email / NPN) |
| `ProspectActivity` | prospect_id, type (created/imported/note/call/email_sent/stage_change/do_not_contact/trial), summary, details, actor |
| `AuditLog` | actor, action, entity, before/after, at |

### Lead lifecycle
```
received → validating → rejected
                     ↘ ready → offered → sold_exclusive
                                       → sold_shared (1..3)
                                       → held (≤24h, re-offered)
                                       → aged → sold_aged
any state → suppressed (opt-out / deletion)   sold → returned (credited)
```

---

## 6. Pricing & billing

- Prices are **configuration**, by line × tier × product. Starting points to test in Phase 0
  (verify against market as buyers respond): final expense exclusive ~$25–40, shared ~$10–15 per
  buyer, aged ~$1–3.
- Sale = ledger debit at time of sale; return approval = ledger credit.
- Balance = sum of ledger entries (never stored and edited directly).
- Stripe Checkout for top-ups; optional auto-recharge below a threshold.
- Promotional/trial leads are recorded as sales with `promotional = true` and a `promo` ledger entry
  so reports stay accurate.

---

## 7. Key metrics
- Margin by source/campaign/affiliate (revenue − cost − returns)
- Sell-through rate; time to sale
- Return rate (target < 10–15%) by source and buyer
- Buyer retention; wallet burn rate
- Buyer finder: prospects contacted → trials → paying conversion

---

## 8. Architecture & stack (AI-maintainable, ~$200/month)

**Principles:** one language, mainstream tools, few vendors, pure tested core, config over code.

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Web app (landing pages, portal, admin, API) | Next.js (App Router) |
| i18n | Typed EN/ES message files (`es` checked against `en` by the compiler) |
| Database | Postgres |
| ORM / migrations | Drizzle |
| Validation | Zod (all inputs, filters, webhook payloads) |
| Background jobs | pg-boss (queue in Postgres — no extra vendor) |
| Auth | Phase 0: single owner password + signed cookie. Phase 1 (M3): Auth.js with email magic links |
| Email | Resend (transactional) |
| SMS / phone lookup | Twilio |
| Consent certificates | TrustedForm |
| Payments | Stripe |
| Hosting | Railway (web + worker + Postgres in one place) |
| AI (outreach drafts) | Claude API via `@anthropic-ai/sdk` in `packages/integrations` (optional; a few cents per draft) |
| Tests | Vitest (unit/integration), Playwright (critical flows) |
| CI | GitHub Actions: typecheck, lint, test, migration check |

### Repo layout
```
apps/web/                 Next.js: landing pages, buyer portal, admin, API routes
apps/worker/              pg-boss workers: validation, routing, delivery, aging, retries
packages/core/            PURE domain logic (no I/O): eligibility, routing, pricing, returns,
                          state rules, scoring. Highest test coverage.
packages/db/              Drizzle schema, migrations, seed data
packages/integrations/    Thin adapters (Twilio, TrustedForm, Stripe, Resend) behind interfaces,
                          each with a fake for tests
docs/                     PLAN.md, runbooks/, decisions/
```

### Monthly budget (estimates — verify current vendor pricing)
| Item | Est. / month |
|---|---|
| Railway (web, worker, Postgres) | $10–40 |
| Domain(s) | ~$2 |
| Resend | $0–20 |
| Twilio (SMS alerts + phone lookups) | $10–40, scales with volume |
| TrustedForm | varies by plan/volume — confirm |
| Stripe | ~3% of top-ups (not a fixed cost) |
| Litigator scrub service | **deferred** until volume justifies; suppression + dedupe in-house first |
| **Target total** | **≤ ~$200** |

Excluded from the platform budget: ad spend, mailer printing/postage, affiliate payouts, legal fees.

---

## 9. Roadmap

### Phase 0 — Foundation (weeks 1–2)

**Owner tasks**
- [ ] Business entity (LLC), EIN, business bank account
- [ ] Brand name + domain
- [ ] Engage a TCPA/insurance-marketing attorney; send them the §3.7 drafts
- [ ] Create accounts: Stripe, TrustedForm, Twilio, Resend, Railway, (GitHub already exists)
- [ ] Start licensing process (note: becoming licensed may change some rules — check with counsel)
- [ ] List 20–50 initial buyer prospects (or let the buyer finder help)

**Claude tasks**
- [x] Scaffold monorepo, CI, CLAUDE.md conventions, Drizzle schema for Phase 0 entities
- [x] Landing pages EN + ES per product line with consent capture and TrustedForm hook
- [x] Admin Markets page: switch products and states on/off, set age ranges
- [x] Lead storage + admin lead list/detail + CSV export (for manual trial sales)
- [x] Consumer opt-out page (EN/ES) → suppression list
- [x] Buyer finder v1: prospects, CSV import, pipeline stages, follow-ups, notes, AI outreach drafts
- [x] Drafts for counsel: consent text (EN/ES), buyer agreement, privacy policy, terms (`docs/legal/`)
- [ ] Publish privacy/terms/partners pages once counsel approves (placeholders today)
- [ ] Outreach email templates and a one-page buyer pitch

**Exit criteria:** counsel-approved consent live; first leads captured; ≥3 trial buyers.

### Phase 1 — MVP (weeks 3–8)
- M1: Intake API + all source types + campaigns + cost entry
- M2: Quality pipeline (normalize, validate, fraud, suppression, dedupe, score)
- M3: Buyer accounts, licenses, agreement acceptance, wallet + Stripe, ledger; partner list page
  backed by buyer records, and the partner list in effect saved into each consent snapshot
- M4: Buyer campaigns + distribution engine + webhook/email/SMS delivery
- M5: Returns flow; admin dashboards (margin by source, return rates)
- M6: Data-request (access/deletion) handling — deletion anonymizes lead PII but keeps the consent
  snapshot as legal evidence (confirm with counsel); hardening and launch checklist

**Exit criteria:** leads sell automatically to paying buyers; margin-by-source report is trustworthy.

### Phase 2 — Scale (months 3–4)
Affiliate portal + API keys; SMS (must honor STOP **and Spanish keywords** such as ALTO/PARAR);
CRM integrations (GoHighLevel, AgencyZoom, etc.); aged-lead store;
Medicare Supplement line; Spanish buyer portal; buyer outcome reporting; litigator scrub vendor.

### Phase 3 — Medicare & marketplace (before next AEP, Oct 2027)
Medicare Advantage/Part D (after counsel sign-off on CMS rules); ping-post; external suppliers +
payouts; live transfers; owner's own agency as buyer with "first look".

---

## 10. Risks
| Risk | Mitigation |
|---|---|
| TCPA / FTSA lawsuits | Counsel-reviewed consent, immutable snapshots, certificates, suppression, affiliate controls |
| No buyers | Buyer finder + trial leads in Phase 0, before heavy build |
| Fraudulent affiliate leads | Certificates required, per-affiliate quality metrics, one-click pause |
| Unlicensed-seller restrictions | Flat per-lead pricing only; counsel confirms per state/line |
| Budget overrun | Few vendors, Postgres-based queue, defer scrub vendor |
| AI-introduced bugs in money/compliance | Pure `core` package, mandatory tests, CI gate, append-only ledger |

---

## 11. Decision log
| Date | Decision |
|---|---|
| 2026-10-13 | v1.0 plan approved: D1–D9 above |
| 2026-10-13 | i18n via typed message files instead of next-intl (fewer dependencies, compiler-checked parity) |
| 2026-10-13 | Phase 0 admin login is a single owner password; real accounts arrive with buyer logins (M3) |
| 2026-10-13 | `apps/worker` deferred until the first background job; `packages/integrations` added with the Claude outreach writer |
| 2026-10-13 | Out-of-area ZIPs are rejected at the form and not stored (data minimization) |
| 2026-10-13 | Immutability of consent snapshots, consent wording, and audit log enforced by DB triggers |
| 2026-10-13 | Deploy as a Docker image (Railway); migrations + idempotent seed run at container start; search indexing off until `ALLOW_INDEXING=true` (see `docs/runbooks/deploy-railway.md`) |
| 2026-10-13 | Buyer finder emails are drafted by Claude but sent by the owner from their own mail app (no automated sending; keeps volume human-scale and CAN-SPAM simple) |
| 2026-10-13 | D1 changed: from final expense only to multiple admin-selectable "living benefit" lines; final expense off by default. Products and states are switched on/off in Admin → Markets |
