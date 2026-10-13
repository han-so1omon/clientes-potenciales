# CLAUDE.md

Insurance lead generation and sales platform (seniors 60+, Southeast US, English/Spanish).
**Read `docs/PLAN.md` before making product or architecture changes.** It is the source of truth;
update it (and its Decision Log) when a decision changes.

This project is maintained primarily by AI. Optimize for code that a future AI session can change
safely: small modules, explicit types, tests next to logic, no cleverness.

## Non-negotiable rules

1. **Money is integer cents.** Never floats. Never store a balance — derive it from `LedgerEntry`.
2. **The ledger is append-only.** Corrections are new `adjustment` entries with a reason.
3. **Consent snapshots are immutable.** Never update or delete a `ConsentSnapshot` row.
4. **No lead is sold without a valid consent snapshot**, to a buyer without a verified license in the
   lead's state, or if the consumer is on the suppression list.
5. **Flat per-lead pricing only.** Do not build commission-sharing or pay-per-policy features
   (owner is not licensed — see PLAN.md D6).
6. **Business rules live in `packages/core`** as pure functions (no DB, network, or clock access —
   pass time in). Every rule there needs unit tests, including edge cases.
7. **Rules that change often are data, not code:** prices, consent text, state calling rules,
   buyer filters. Edit them through config/admin, not hard-coded constants.
8. **Every external service goes through `packages/integrations`** behind an interface with a fake
   implementation for tests. Never call a vendor SDK directly from app code.
9. **Validate all external input with Zod** (forms, API, webhooks, CSV imports).
10. **Never log full PII** (phone, email, DOB, name). Log lead ids.
11. Customer-facing copy (landing pages, consent, emails) must exist in **both English and Spanish**.
    Consent text is only changed by adding a new `ConsentVersion`, never by editing an active one.
12. Admin actions that change data write an `AuditLog` entry.

## Conventions

- TypeScript strict mode; no `any` without a comment explaining why.
- Database changes only via Drizzle migrations; never edit an applied migration.
- Tests: Vitest for unit/integration, Playwright for critical user flows (form submit → lead stored,
  buyer top-up → lead delivered, return → credit).
- Before finishing a change, run typecheck, lint, and tests (commands below) and make sure they pass.
- Keep PRs focused on one milestone task from PLAN.md §9.

## Commands

_To be filled in when the monorepo is scaffolded (Phase 0)._

## Repo layout

See PLAN.md §8. In short: `apps/web` (Next.js), `apps/worker` (pg-boss jobs), `packages/core`
(pure domain logic), `packages/db` (Drizzle), `packages/integrations` (vendor adapters), `docs/`.
