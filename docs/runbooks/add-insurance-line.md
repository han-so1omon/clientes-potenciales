# Runbook: add a new insurance product line

Switching an existing line on/off or changing its age range needs **no code**: use
Admin → Markets. Follow this runbook only to add a line the catalog does not have yet.

1. **Catalog** — add the key to `LINES` and an entry to `LINE_CATALOG` in
   `packages/core/src/lines.ts` (slug, EN/ES product names, default ages, `defaultEnabled`,
   `interestOptions`, `extraLegalReview`). Never ask health questions in `interestOptions`.
2. **Copy** — add the line under `lines` in `apps/web/src/lib/messages/en.ts` and `es.ts`
   (title, headline, subhead, two points, question, an option label for every interest option).
   The compiler and `messages.test.ts` fail until both languages are complete.
3. **Seed** — run `pnpm db:seed` (locally and on the host). It adds the line's settings row
   (using the defaults) and DRAFT consent versions in both languages. It never overwrites
   settings that already exist.
4. **Legal** — send the line's consent text to counsel. Leads for the line are not sellable until
   an approved consent version exists for that line and language.
5. **Check** — `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
6. **Go live** — turn the line on in Admin → Markets.

No database migration is needed: line keys are text, validated against the catalog.
