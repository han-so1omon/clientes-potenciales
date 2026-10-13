import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDb, databaseUrl } from "./client";

export async function runMigrations(url: string): Promise<void> {
  const db = createDb(url, { max: 1 });
  await migrate(db, { migrationsFolder: fileURLToPath(new URL("../migrations", import.meta.url)) });
  await db.$client.end();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runMigrations(databaseUrl());
  console.log("Migrations applied");
}
