import { describe, expect, it } from "vitest";
import { ageOn, isValidDate, toIsoDate } from "./age";

describe("isValidDate", () => {
  it("accepts real dates including leap day", () => {
    expect(isValidDate({ year: 1960, month: 2, day: 29 })).toBe(true);
  });
  it("rejects impossible dates", () => {
    expect(isValidDate({ year: 1961, month: 2, day: 29 })).toBe(false);
    expect(isValidDate({ year: 1960, month: 4, day: 31 })).toBe(false);
    expect(isValidDate({ year: 1960, month: 13, day: 1 })).toBe(false);
  });
});

describe("ageOn", () => {
  const now = new Date("2026-10-13T12:00:00Z");
  it("counts a birthday that already happened this year", () => {
    expect(ageOn({ year: 1960, month: 1, day: 1 }, now)).toBe(66);
  });
  it("is one less the day before the birthday", () => {
    expect(ageOn({ year: 1960, month: 10, day: 14 }, now)).toBe(65);
  });
  it("counts the birthday itself", () => {
    expect(ageOn({ year: 1960, month: 10, day: 13 }, now)).toBe(66);
  });
});

describe("toIsoDate", () => {
  it("zero-pads", () => {
    expect(toIsoDate({ year: 1955, month: 3, day: 7 })).toBe("1955-03-07");
  });
});
