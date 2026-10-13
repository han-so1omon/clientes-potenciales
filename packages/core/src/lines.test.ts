import { describe, expect, it } from "vitest";
import { LINE_CATALOG, LINES, lineFromSlug, validateAgeRange } from "./lines";

describe("LINE_CATALOG", () => {
  it("has unique slugs", () => {
    const slugs = LINES.map((line) => LINE_CATALOG[line].slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has valid default age ranges and at least two answer options per line", () => {
    for (const line of LINES) {
      const def = LINE_CATALOG[line];
      expect(validateAgeRange(def.defaultMinAge, def.defaultMaxAge)).toBeUndefined();
      expect(def.interestOptions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps final expense (burial) and Medicare off by default", () => {
    expect(LINE_CATALOG.final_expense.defaultEnabled).toBe(false);
    expect(LINE_CATALOG.medicare_supplement.defaultEnabled).toBe(false);
    expect(LINE_CATALOG.medicare_supplement.extraLegalReview).toBe(true);
  });
});

describe("lineFromSlug", () => {
  it("finds lines by slug", () => {
    expect(lineFromSlug("long-term-care")).toBe("long_term_care");
    expect(lineFromSlug("nope")).toBeUndefined();
  });
});

describe("validateAgeRange", () => {
  it.each([
    [50, 85, undefined],
    [65, 65, undefined],
    [17, 85, "Ages must be between 18 and 100"],
    [50, 101, "Ages must be between 18 and 100"],
    [80, 60, "Minimum age must not be greater than maximum age"],
    [50.5, 85, "Ages must be whole numbers"],
  ])("min %s max %s → %s", (min, max, expected) => {
    expect(validateAgeRange(min, max)).toBe(expected);
  });
});
