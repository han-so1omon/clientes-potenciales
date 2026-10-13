import { LINES } from "@cp/core";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "./client";
import {
  consentStatusByLine,
  getLineSettings,
  listEnabledLines,
  listEnabledStates,
  listLineSettings,
  setStateEnabled,
  updateLineSettings,
} from "./markets";
import { auditLog } from "./schema";
import { seed } from "./seed";
import { TEST_DATABASE_URL } from "./test/globalSetup";

const db = createDb(TEST_DATABASE_URL, { max: 2 });

beforeAll(async () => {
  await seed(db);
  await db.execute(sql`TRUNCATE audit_log`);
});

afterAll(async () => {
  await db.$client.end();
});

describe("line settings", () => {
  it("seeds every catalog line; burial and Medicare start switched off", async () => {
    const settings = await listLineSettings(db);
    expect(settings.map((s) => s.line)).toEqual([...LINES]);
    const enabled = await listEnabledLines(db);
    expect(enabled).toContain("long_term_care");
    expect(enabled).not.toContain("final_expense");
    expect(enabled).not.toContain("medicare_supplement");
  });

  it("updates availability and age range with an audit entry", async () => {
    const result = await updateLineSettings(db, {
      line: "final_expense",
      enabled: true,
      minAge: 55,
      maxAge: 80,
      actor: "owner",
    });
    expect(result).toEqual({ kind: "updated" });
    expect(await getLineSettings(db, "final_expense")).toEqual({
      line: "final_expense",
      enabled: true,
      minAge: 55,
      maxAge: 80,
    });
    const audits = await db.select().from(auditLog);
    expect(audits.at(-1)).toMatchObject({ action: "line.update", entityId: "final_expense" });
  });

  it("rejects bad input without changing anything", async () => {
    expect(
      await updateLineSettings(db, {
        line: "pet_insurance",
        enabled: true,
        minAge: 50,
        maxAge: 80,
        actor: "owner",
      }),
    ).toMatchObject({ kind: "invalid" });
    expect(
      await updateLineSettings(db, {
        line: "long_term_care",
        enabled: true,
        minAge: 90,
        maxAge: 60,
        actor: "owner",
      }),
    ).toMatchObject({ kind: "invalid" });
    expect((await getLineSettings(db, "long_term_care"))?.minAge).toBe(50);
  });

  it("re-running the seed does not overwrite admin changes", async () => {
    await seed(db);
    expect((await getLineSettings(db, "final_expense"))?.minAge).toBe(55);
  });

  it("reports draft consent for every line and language", async () => {
    const status = await consentStatusByLine(db);
    for (const line of LINES) {
      expect(status(line, "en")).toEqual({ version: 1, approved: false });
      expect(status(line, "es")).toEqual({ version: 1, approved: false });
    }
  });
});

describe("service states", () => {
  it("toggles states and ignores unknown ones", async () => {
    expect(await setStateEnabled(db, { state: "TN", enabled: false, actor: "owner" })).toBe(true);
    expect(await listEnabledStates(db)).not.toContain("TN");
    expect(await setStateEnabled(db, { state: "CA", enabled: true, actor: "owner" })).toBe(false);
    await setStateEnabled(db, { state: "TN", enabled: true, actor: "owner" });
    expect(await listEnabledStates(db)).toContain("TN");
  });
});
