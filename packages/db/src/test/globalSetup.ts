import postgres from "postgres";
import { runMigrations } from "../migrate";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/clientes_test";

/** Drops and recreates the public schema, then applies all migrations. */
export default async function setup(): Promise<void> {
  const sql = postgres(TEST_DATABASE_URL, { max: 1, onnotice: () => {} });
  await sql.unsafe(
    "DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;",
  );
  await sql.end();
  await runMigrations(TEST_DATABASE_URL);
}
