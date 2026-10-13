import type { Db } from "./client";
import { auditLog } from "./schema";

export async function writeAudit(
  db: Db,
  entry: {
    actor: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  await db.insert(auditLog).values({ ...entry, details: entry.details ?? {} });
}
