import { describe, expect, it } from "vitest";
import { CENTRAL, EASTERN, lookupZip } from "./geo";

describe("lookupZip", () => {
  it.each([
    ["33101", "FL", EASTERN], // Miami
    ["32501", "FL", CENTRAL], // Pensacola
    ["32301", "FL", EASTERN], // Tallahassee
    ["30301", "GA", EASTERN], // Atlanta
    ["35203", "AL", CENTRAL], // Birmingham
    ["39201", "MS", CENTRAL], // Jackson
    ["37201", "TN", CENTRAL], // Nashville
    ["37902", "TN", EASTERN], // Knoxville
    ["37402", "TN", EASTERN], // Chattanooga
    ["38103", "TN", CENTRAL], // Memphis
    ["29201", "SC", EASTERN], // Columbia
    ["27601", "NC", EASTERN], // Raleigh
    ["70112", "LA", CENTRAL], // New Orleans
  ])("maps %s to %s", (zip, state, tz) => {
    expect(lookupZip(zip)).toEqual({ state, timeZone: tz });
  });

  it.each(["10001", "90210", "34002", "70201", "1234", "abcde", "", "331011"])(
    "returns undefined for %s (outside area or malformed)",
    (zip) => {
      expect(lookupZip(zip)).toBeUndefined();
    },
  );

  it("trims whitespace", () => {
    expect(lookupZip(" 33101 ")?.state).toBe("FL");
  });
});
