# Runbook: deploy to Railway

The app ships as a Docker image (`Dockerfile` at the repo root). On every start the container runs
`scripts/start.sh`, which applies database migrations, runs the seed (adds new catalog rows; never
overwrites admin settings), then starts the web server. Migrations are safe to re-run.

## One-time setup (owner, ~15 minutes)

1. **Create a Railway account** at railway.com and choose a paid plan (the free trial sleeps
   services; a small app + Postgres typically runs in the $5–20/month range — check current pricing).
2. **New Project → Deploy from GitHub repo** → pick `clientes-potenciales`, branch `main`.
   Railway detects the `Dockerfile` and builds it. The first deploy will fail until step 4 is done —
   that's expected.
3. **Add the database:** in the project, **New → Database → PostgreSQL**.
4. **Set variables** on the web service (Variables tab):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Reference the Postgres service's `DATABASE_URL` (Railway offers it in the variable picker, e.g. `${{Postgres.DATABASE_URL}}`) |
   | `PII_HASH_SECRET` | A long random string — generate with `openssl rand -hex 32`. **Never change it after launch**: duplicate detection and the opt-out list depend on it. |
   | `ADMIN_SESSION_SECRET` | Another `openssl rand -hex 32` |
   | `ADMIN_PASSWORD` | A strong password only you know (12+ characters) |
   | `OUTREACH_SENDER_NAME` | Your name as it should appear in buyer emails |
   | `BUSINESS_NAME` | Your legal business name |
   | `BUSINESS_MAILING_ADDRESS` | Your business postal address (required in commercial email) |
   | `ANTHROPIC_API_KEY` | Optional — enables AI-drafted outreach emails |
   | `TRUSTEDFORM_ENABLED` | `false` until the TrustedForm account is set up, then `true` |
   | `ALLOW_INDEXING` | `false` until counsel approves the consent text and you are ready for traffic |

5. **Redeploy** (Deployments → Redeploy). In the deploy logs you should see `Migrations applied`,
   `Seed complete`, then `Ready`.
6. **Public URL:** Settings → Networking → **Generate Domain** (a `*.up.railway.app` address).
   Later, add your own domain there and point its DNS as Railway instructs.
7. **Health check (recommended):** Settings → set the healthcheck path to `/api/health`, so a
   deploy that can't reach the database never replaces a working one.
8. **Backups:** confirm backups are enabled for the Postgres service (Railway's database settings).

## Smoke test after each deploy
- `https://<your-domain>/api/health` → `{"ok":true}`
- `https://<your-domain>/en` and `/es` list the products switched on.
- `https://<your-domain>/admin` → sign in with `ADMIN_PASSWORD`; check Leads, Markets, Buyer finder.
- While the consent text is still a draft, landing pages show the yellow DRAFT banner — do not send
  real traffic (ads, mailers) to them until counsel approves the consent and you add the approved version.

## Updating
Merging to `main` redeploys automatically. Database changes ride along as migrations and run at startup.

## If something goes wrong
- **Deploy fails at startup:** read the deploy logs. Missing/invalid variables are reported by name
  (e.g. `PII_HASH_SECRET` too short).
- **Bad release:** Deployments → pick the previous successful deployment → **Redeploy**. Note that
  migrations are not rolled back automatically; new migrations are written to be additive.
