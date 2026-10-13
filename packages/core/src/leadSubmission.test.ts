import { describe, expect, it } from "vitest";
import { type LeadSubmissionInput, parseLeadSubmission } from "./leadSubmission";

const NOW = new Date("2026-10-13T15:00:00Z");

const valid: LeadSubmissionInput = {
  line: "final_expense",
  language: "es",
  consentVersionId: "3f1c2b9e-8a4d-4c3b-9f1e-2a7d6c5b4e3f",
  consentGiven: "yes",
  firstName: " María ",
  lastName: "González",
  phone: "(305) 555-1234",
  email: "Maria@Example.com",
  birthMonth: "4",
  birthDay: "12",
  birthYear: "1958",
  zip: "33101",
  coverageAmount: "10000",
  bestTimeToCall: "morning",
  campaignCode: "MAILER-OCT",
  utmSource: "facebook",
  trustedFormCertUrl: "https://cert.trustedform.com/abc123",
  formStartedAt: String(NOW.getTime() - 95_000),
  website: "",
};

function expectInvalid(raw: unknown) {
  const result = parseLeadSubmission(raw, NOW);
  if (result.kind !== "invalid") throw new Error(`expected invalid, got ${result.kind}`);
  return result.errors;
}

describe("parseLeadSubmission", () => {
  it("accepts and normalizes a valid submission", () => {
    const result = parseLeadSubmission(valid, NOW);
    expect(result).toEqual({
      kind: "accepted",
      lead: {
        line: "final_expense",
        language: "es",
        consentVersionId: valid.consentVersionId,
        firstName: "María",
        lastName: "González",
        phoneE164: "+13055551234",
        email: "maria@example.com",
        dateOfBirth: "1958-04-12",
        ageAtSubmission: 68,
        zip: "33101",
        state: "FL",
        timeZone: "America/New_York",
        coverageAmount: "10000",
        bestTimeToCall: "morning",
        campaignCode: "MAILER-OCT",
        utm: { source: "facebook", medium: undefined, campaign: undefined, content: undefined },
        trustedFormCertUrl: "https://cert.trustedform.com/abc123",
        formFillSeconds: 95,
      },
    });
  });

  it("treats a blank email as absent", () => {
    const result = parseLeadSubmission({ ...valid, email: "" }, NOW);
    expect(result.kind === "accepted" && result.lead.email).toBeUndefined();
  });

  it("silently discards honeypot submissions", () => {
    expect(parseLeadSubmission({ ...valid, website: "http://spam" }, NOW)).toEqual({
      kind: "discarded",
    });
  });

  it("requires consent", () => {
    expect(expectInvalid({ ...valid, consentGiven: undefined }).consentGiven).toBe(
      "consent_required",
    );
  });

  it("flags missing required fields", () => {
    expect(expectInvalid({ ...valid, firstName: "" }).firstName).toBe("required");
    expect(expectInvalid({ ...valid, lastName: undefined }).lastName).toBe("required");
  });

  it("flags blank date parts as required, and nonsense as invalid", () => {
    expect(expectInvalid({ ...valid, birthYear: "" }).birthYear).toBe("required");
    expect(expectInvalid({ ...valid, birthMonth: "" }).birthMonth).toBe("required");
    expect(expectInvalid({ ...valid, birthYear: "1800" }).birthYear).toBe("invalid");
  });

  it("rejects invalid email", () => {
    expect(expectInvalid({ ...valid, email: "not-an-email" }).email).toBe("invalid");
  });

  it("rejects invalid phone", () => {
    expect(expectInvalid({ ...valid, phone: "(111) 555-1234" }).phone).toBe("invalid_phone");
  });

  it("rejects impossible dates", () => {
    expect(expectInvalid({ ...valid, birthMonth: "2", birthDay: "30" }).birthDay).toBe(
      "invalid_date",
    );
  });

  it("enforces the line's age range", () => {
    expect(expectInvalid({ ...valid, birthYear: "1990" }).birthYear).toBe("age_out_of_range");
    expect(expectInvalid({ ...valid, birthYear: "1930" }).birthYear).toBe("age_out_of_range");
  });

  it("rejects ZIPs outside the service area", () => {
    expect(expectInvalid({ ...valid, zip: "10001" }).zip).toBe("out_of_area");
  });

  it("reports several problems together", () => {
    const errors = expectInvalid({ ...valid, phone: "123-456-7890", zip: "90210" });
    expect(errors).toMatchObject({ phone: "invalid_phone", zip: "out_of_area" });
  });

  it("drops a TrustedForm URL that is not a certificate URL", () => {
    const result = parseLeadSubmission(
      { ...valid, trustedFormCertUrl: "https://evil.example.com/x" },
      NOW,
    );
    expect(result.kind === "accepted" && result.lead.trustedFormCertUrl).toBeUndefined();
  });

  it("ignores a form start time in the future", () => {
    const result = parseLeadSubmission(
      { ...valid, formStartedAt: String(NOW.getTime() + 1000) },
      NOW,
    );
    expect(result.kind === "accepted" && result.lead.formFillSeconds).toBeUndefined();
  });

  it("rejects unknown languages and lines", () => {
    expect(expectInvalid({ ...valid, language: "fr" }).language).toBe("invalid");
    expect(expectInvalid({ ...valid, line: "medicare_advantage" }).line).toBe("invalid");
  });
});
