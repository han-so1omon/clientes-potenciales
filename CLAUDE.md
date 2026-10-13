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

Run from the repo root (pnpm workspaces, Node 22+, Postgres 16).

| Task | Command |
|---|---|
| Install | `pnpm install` |
| Lint / format check | `pnpm lint` (auto-fix: `pnpm format`) |
| Typecheck | `pnpm typecheck` |
| Unit + DB integration tests | `pnpm test` (needs Postgres; DB tests use `TEST_DATABASE_URL`, default `postgres://postgres:postgres@localhost:5432/clientes_test`) |
| End-to-end tests | `pnpm build && pnpm test:e2e` (uses `E2E_DATABASE_URL`, default `.../clientes_e2e`; set `PLAYWRIGHT_CHROMIUM_PATH` to use a preinstalled Chromium) |
| Dev server | `pnpm dev` (env in `apps/web/.env.local`, see `apps/web/.env.example`) |
| New migration | edit `packages/db/src/schema.ts`, then `pnpm db:generate` |
| Custom SQL migration (triggers etc.) | `pnpm --filter @cp/db exec drizzle-kit generate --custom --name <name>` |
| Apply migrations / seed | `DATABASE_URL=... pnpm db:migrate` / `pnpm db:seed` |

All of lint, typecheck, `pnpm test`, and e2e must pass before pushing; CI runs the same steps.

## Where things live

- Product lines catalog (what exists): `packages/core/src/lines.ts`; live on/off + ages + states
  are DB settings edited in Admin → Markets (`packages/db/src/markets.ts`). Adding a line:
  `docs/runbooks/add-insurance-line.md`.
- Lead form validation & normalization: `packages/core/src/leadSubmission.ts`
- Compliance gate (can this lead be sold?): `packages/core/src/sellability.ts`
- ZIP → state/time zone: `packages/core/src/geo.ts`
- DB immutability triggers: `packages/db/migrations/0001_immutability.sql`
- Site copy (EN/ES): `apps/web/src/lib/messages/{en,es}.ts` — `es` is type-checked against `en`,
  and a test checks the consent text quotes the exact submit-button label.
- Draft consent templates seeded from `packages/db/src/seedData/consent.ts` (source: `docs/legal/`);
  `{{PRODUCT}}` is replaced by each line's name.
- Server actions are public endpoints: every admin action must call `requireAdmin()` itself.
- Admin console: `apps/web/src/app/admin/`; every admin page/route must call `requireAdmin()`/`isAdmin()`.

## Repo layout

See PLAN.md §8. Today: `apps/web` (Next.js), `packages/core` (pure domain logic), `packages/db`
(Drizzle), `docs/` (plan + legal drafts). Added when first needed: `apps/worker` (pg-boss jobs),
`packages/integrations` (vendor adapters).
