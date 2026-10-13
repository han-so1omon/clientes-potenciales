import { describe, expect, it } from "vitest";
import { maskPhone, normalizeUsPhone } from "./phone";

describe("normalizeUsPhone", () => {
  it.each([
    ["(305) 555-1234", "+13055551234"],
    ["305-555-1234", "+13055551234"],
    ["1 305 555 1234", "+13055551234"],
    ["+1 (305) 555-1234", "+13055551234"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeUsPhone(input)).toBe(expected);
  });

  it.each([
    ["305555123", "too short"],
    ["23055551234", "11 digits not starting with 1"],
    ["(105) 555-1234", "area code starts with 1"],
    ["(305) 055-1234", "exchange starts with 0"],
    ["(411) 555-1234", "N11 area code"],
    ["(305) 555-0123", "reserved 555-01XX"],
    ["", "empty"],
  ])("rejects %s (%s)", (input) => {
    expect(normalizeUsPhone(input)).toBeUndefined();
  });
});

describe("maskPhone", () => {
  it("keeps only country code and last 4 digits", () => {
    expect(maskPhone("+13055551234")).toBe("+1******1234");
  });
});
