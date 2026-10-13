import "server-only";
import { createDb, type Db } from "@cp/db";
import { serverEnv } from "./env";

const globalForDb = globalThis as unknown as { db?: Db };

/** Shared database connection (reused across hot reloads in development). */
export function getDb(): Db {
  globalForDb.db ??= createDb(serverEnv().DATABASE_URL);
  return globalForDb.db;
}
