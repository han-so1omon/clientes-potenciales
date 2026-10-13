import { normalizeEmail, piiHash } from "@cp/core";
import { eq, or } from "drizzle-orm";
import type { Db } from "./client";
import { auditLog, leads, suppressions } from "./schema";

/**
 * Adds a consumer to the suppression list and marks their existing leads suppressed.
 * Returns how many leads were marked. Writes an audit log entry.
 */
export async function suppressConsumer(
  db: Db,
  input: { phoneE164?: string; email?: string; reason: string; source: string; actor: string },
  hashSecret: string,
): Promise<number> {
  const phoneHash = input.phoneE164 ? piiHash(input.phoneE164, hashSecret) : null;
  const emailHash = input.email ? piiHash(normalizeEmail(input.email), hashSecret) : null;
  if (!phoneHash && !emailHash) throw new Error("phone or email required");

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(suppressions)
      .values({ phoneHash, emailHash, reason: input.reason, source: input.source })
      .returning({ id: suppressions.id });

    const matches = [
      ...(phoneHash ? [eq(leads.phoneHash, phoneHash)] : []),
      ...(emailHash ? [eq(leads.emailHash, emailHash)] : []),
    ];
    const updated = await tx
      .update(leads)
      .set({ status: "suppressed", statusReason: input.reason })
      .where(or(...matches))
      .returning({ id: leads.id });

    await tx.insert(auditLog).values({
      actor: input.actor,
      action: "suppression.create",
      entityType: "suppression",
      entityId: row?.id,
      details: { reason: input.reason, source: input.source, leadsSuppressed: updated.length },
    });
    return updated.length;
  });
}
