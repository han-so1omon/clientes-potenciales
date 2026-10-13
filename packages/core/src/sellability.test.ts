import { describe, expect, it } from "vitest";
import { type SellabilityInput, sellabilityBlockers } from "./sellability";

const clean: SellabilityInput = {
  status: "ready",
  hasConsentSnapshot: true,
  consentVersionCounselApproved: true,
  hasConsentCertificate: true,
  suppressed: false,
};

describe("sellabilityBlockers", () => {
  it("returns no blockers for a compliant lead", () => {
    expect(sellabilityBlockers(clean)).toEqual([]);
  });

  it.each([
    [{ hasConsentSnapshot: false }, "no_consent_snapshot"],
    [{ consentVersionCounselApproved: false }, "consent_not_counsel_approved"],
    [{ hasConsentCertificate: false }, "missing_consent_certificate"],
    [{ suppressed: true }, "suppressed"],
    [{ status: "rejected" }, "rejected"],
  ] as const)("blocks %o with %s", (override, blocker) => {
    expect(sellabilityBlockers({ ...clean, ...override })).toEqual([blocker]);
  });

  it("reports every blocker at once", () => {
    expect(
      sellabilityBlockers({
        status: "rejected",
        hasConsentSnapshot: false,
        consentVersionCounselApproved: false,
        hasConsentCertificate: false,
        suppressed: true,
      }),
    ).toHaveLength(5);
  });
});
