import { createDb } from "@cp/db";
import { runMigrations } from "@cp/db/migrate";
import { seed } from "@cp/db/seed";
import postgres from "postgres";
import { E2E_DATABASE_URL } from "../playwright.config";

/** Fresh schema + seed data before the e2e run. Requires `next build` to have run. */
export default async function globalSetup(): Promise<void> {
  const sql = postgres(E2E_DATABASE_URL, { max: 1, onnotice: () => {} });
  await sql.unsafe(
    "DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;",
  );
  await sql.end();
  await runMigrations(E2E_DATABASE_URL);
  const db = createDb(E2E_DATABASE_URL, { max: 1 });
  await seed(db);
  await db.$client.end();
}
