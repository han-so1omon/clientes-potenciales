# Clientes Potenciales

Platform for generating, verifying, and selling insurance leads (seniors 60+, Southeast US,
English/Spanish) to licensed agents and agencies.

- Product & implementation plan: [`docs/PLAN.md`](docs/PLAN.md)
- Guidance for AI maintainers: [`CLAUDE.md`](CLAUDE.md)
- Legal drafts for attorney review: [`docs/legal/`](docs/legal/README.md)

Status: Phase 0 in progress — landing pages (EN/ES) for several senior "living benefit" insurance
lines that the admin switches on/off, lead capture with consent records, consumer opt-out, an
admin console with compliant CSV export, and a buyer finder (prospect CRM with AI-drafted outreach).

## Local setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # then edit values
createdb clientes                               # Postgres 16
DATABASE_URL=postgres://postgres:postgres@localhost:5432/clientes pnpm db:migrate
DATABASE_URL=postgres://postgres:postgres@localhost:5432/clientes pnpm db:seed
pnpm dev   # http://localhost:3000/en  ·  admin: /admin
```

See [`CLAUDE.md`](CLAUDE.md) for test commands and rules, and
[`docs/runbooks/deploy-railway.md`](docs/runbooks/deploy-railway.md) to deploy.
