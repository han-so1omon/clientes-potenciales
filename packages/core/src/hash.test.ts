import { describe, expect, it } from "vitest";
import { normalizeEmail, piiHash } from "./hash";

const SECRET = "test-secret-at-least-16-chars";

describe("piiHash", () => {
  it("is deterministic for the same secret", () => {
    expect(piiHash("+13055551234", SECRET)).toBe(piiHash("+13055551234", SECRET));
  });
  it("differs across secrets and values", () => {
    expect(piiHash("+13055551234", SECRET)).not.toBe(piiHash("+13055551234", `${SECRET}x`));
    expect(piiHash("+13055551234", SECRET)).not.toBe(piiHash("+13055551235", SECRET));
  });
  it("does not contain the input", () => {
    expect(piiHash("+13055551234", SECRET)).not.toContain("3055551234");
  });
  it("rejects short secrets", () => {
    expect(() => piiHash("x", "short")).toThrow();
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Jane@Example.COM ")).toBe("jane@example.com");
  });
});
