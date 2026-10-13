import { DRAFT_CONSENT } from "@cp/db/seedData";
import { describe, expect, it } from "vitest";
import { en } from "./en";
import { es } from "./es";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("messages", () => {
  it("Spanish has exactly the same keys as English", () => {
    expect(keyPaths(es).sort()).toEqual(keyPaths(en).sort());
  });

  it("arrays have matching lengths", () => {
    expect(es.months).toHaveLength(12);
    expect(es.finalExpense.bullets).toHaveLength(en.finalExpense.bullets.length);
  });

  it("the consent text quotes the exact submit button label in each language", () => {
    for (const draft of DRAFT_CONSENT) {
      const label = draft.language === "en" ? en.finalExpense.submit : es.finalExpense.submit;
      expect(draft.text).toContain(`"${label}`);
    }
  });
});
