import type { Language, Line } from "@cp/core";
import { and, eq } from "drizzle-orm";
import type { Db } from "./client";
import { consentVersions } from "./schema";

/** The consent disclosure currently shown for a line + language, if any. */
export async function getActiveConsentVersion(db: Db, line: Line, language: Language) {
  const [version] = await db
    .select()
    .from(consentVersions)
    .where(
      and(
        eq(consentVersions.line, line),
        eq(consentVersions.language, language),
        eq(consentVersions.active, true),
      ),
    );
  return version;
}
