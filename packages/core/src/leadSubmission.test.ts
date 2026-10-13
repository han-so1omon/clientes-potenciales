import { describe, expect, it } from "vitest";
import { SERVICE_STATES } from "./geo";
import {
  type LeadSubmissionInput,
  parseLeadSubmission,
  type SubmissionRules,
} from "./leadSubmission";

const NOW = new Date("2026-10-13T15:00:00Z");
const RULES: SubmissionRules = { minAge: 50, maxAge: 85, enabledStates: SERVICE_STATES };

const valid: LeadSubmissionInput = {
  line: "critical_illness",
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
  interest: "25000",
  bestTimeToCall: "morning",
  campaignCode: "MAILER-OCT",
  utmSource: "facebook",
  trustedFormCertUrl: "https://cert.trustedform.com/abc123",
  formStartedAt: String(NOW.getTime() - 95_000),
  website: "",
};

function expectInvalid(raw: unknown) {
  const result = parseLeadSubmission(raw, NOW, RULES);
  if (result.kind !== "invalid") throw new Error(`expected invalid, got ${result.kind}`);
  return result.errors;
}

describe("parseLeadSubmission", () => {
  it("accepts and normalizes a valid submission", () => {
    const result = parseLeadSubmission(valid, NOW, RULES);
    expect(result).toEqual({
      kind: "accepted",
      lead: {
        line: "critical_illness",
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
        interest: "25000",
        bestTimeToCall: "morning",
        campaignCode: "MAILER-OCT",
        utm: { source: "facebook", medium: undefined, campaign: undefined, content: undefined },
        trustedFormCertUrl: "https://cert.trustedform.com/abc123",
        formFillSeconds: 95,
      },
    });
  });

  it("treats a blank email as absent", () => {
    const result = parseLeadSubmission({ ...valid, email: "" }, NOW, RULES);
    expect(result.kind === "accepted" && result.lead.email).toBeUndefined();
  });

  it("silently discards honeypot submissions", () => {
    expect(parseLeadSubmission({ ...valid, website: "http://spam" }, NOW, RULES)).toEqual({
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

  it("enforces the line's age range from the rules", () => {
    expect(expectInvalid({ ...valid, birthYear: "1990" }).birthYear).toBe("age_out_of_range");
    expect(expectInvalid({ ...valid, birthYear: "1930" }).birthYear).toBe("age_out_of_range");
    const narrow = { ...RULES, minAge: 70, maxAge: 79 };
    const result = parseLeadSubmission(valid, NOW, narrow);
    expect(result.kind === "invalid" && result.errors.birthYear).toBe("age_out_of_range");
  });

  it("only accepts answers that belong to the line's question", () => {
    expect(expectInvalid({ ...valid, interest: "dental" }).interest).toBe("invalid");
    const dvh = parseLeadSubmission(
      { ...valid, line: "dental_vision_hearing", interest: "dental" },
      NOW,
      RULES,
    );
    expect(dvh.kind).toBe("accepted");
  });

  it("rejects ZIPs in states the admin has switched off", () => {
    const result = parseLeadSubmission(valid, NOW, { ...RULES, enabledStates: ["GA"] });
    expect(result.kind === "invalid" && result.errors.zip).toBe("out_of_area");
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
      RULES,
    );
    expect(result.kind === "accepted" && result.lead.trustedFormCertUrl).toBeUndefined();
  });

  it("ignores a form start time in the future", () => {
    const result = parseLeadSubmission(
      { ...valid, formStartedAt: String(NOW.getTime() + 1000) },
      NOW,
      RULES,
    );
    expect(result.kind === "accepted" && result.lead.formFillSeconds).toBeUndefined();
  });

  it("rejects unknown languages and lines", () => {
    expect(expectInvalid({ ...valid, language: "fr" }).language).toBe("invalid");
    expect(expectInvalid({ ...valid, line: "medicare_advantage" }).line).toBe("invalid");
  });
});
