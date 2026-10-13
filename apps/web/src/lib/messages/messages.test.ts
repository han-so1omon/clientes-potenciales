import { LINE_CATALOG, LINES } from "@cp/core";
import { DRAFT_CONSENT } from "@cp/db/seedData";
import { describe, expect, it } from "vitest";
import { fill } from "../format";
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
  });

  it.each(LINES)("%s: answer labels exist for exactly the catalog's options", (line) => {
    const options = [...LINE_CATALOG[line].interestOptions].sort();
    expect(Object.keys(en.lines[line].options).sort()).toEqual(options);
    expect(Object.keys(es.lines[line].options).sort()).toEqual(options);
  });

  it("the consent text quotes the exact submit button label in each language", () => {
    for (const draft of DRAFT_CONSENT) {
      const label = draft.language === "en" ? en.landing.submit : es.landing.submit;
      expect(draft.text).toContain(`"${label}`);
    }
  });

  it("consent text names the product in each line's consent", () => {
    for (const draft of DRAFT_CONSENT) {
      expect(draft.text).toContain(LINE_CATALOG[draft.line].names[draft.language]);
      expect(draft.text).not.toContain("{{");
    }
  });

  it("placeholders in age messages are filled", () => {
    expect(fill(es.errors.age_out_of_range, { min: 50, max: 79 })).toBe(
      "Esta cobertura es para personas de 50 a 79 años.",
    );
    expect(fill("keep {unknown}", {})).toBe("keep {unknown}");
  });
});
