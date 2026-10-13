import { z } from "zod";
import { ageOn, isValidDate, toIsoDate } from "./age";
import { lookupZip, type ServiceState, type TimeZone } from "./geo";
import { normalizeEmail } from "./hash";
import { LANGUAGES, type Language, LINE_CATALOG, LINES, type Line } from "./lines";
import { normalizeUsPhone } from "./phone";

export const CALL_TIMES = ["morning", "afternoon", "evening", "any"] as const;

const MAX_UTM_LENGTH = 200;
const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Raw landing-page form input. Field names match the HTML form. */
export const leadSubmissionSchema = z.object({
  line: z.enum(LINES),
  language: z.enum(LANGUAGES),
  consentVersionId: z.uuid(),
  consentGiven: z.literal("yes"),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(10).max(20),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.email().optional()),
  birthMonth: z.coerce.number().int().min(1).max(12),
  birthDay: z.coerce.number().int().min(1).max(31),
  birthYear: z.coerce.number().int().min(1900).max(2100),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/),
  /** Answer to the line's qualifying question (allowed values: LINE_CATALOG[line].interestOptions). */
  interest: z.string().trim().min(1).max(40),
  bestTimeToCall: z.enum(CALL_TIMES),
  campaignCode: optionalTrimmed(64),
  utmSource: optionalTrimmed(MAX_UTM_LENGTH),
  utmMedium: optionalTrimmed(MAX_UTM_LENGTH),
  utmCampaign: optionalTrimmed(MAX_UTM_LENGTH),
  utmContent: optionalTrimmed(MAX_UTM_LENGTH),
  trustedFormCertUrl: optionalTrimmed(500),
  /** Milliseconds since epoch when the form was rendered; used to flag bot-speed submissions. */
  formStartedAt: z.coerce.number().int().optional(),
  /** Honeypot field hidden from humans. Bots tend to fill it in. */
  website: z.string().optional(),
});

export type LeadSubmissionInput = z.input<typeof leadSubmissionSchema>;

export interface NormalizedLead {
  line: Line;
  language: Language;
  consentVersionId: string;
  firstName: string;
  lastName: string;
  phoneE164: string;
  email: string | undefined;
  dateOfBirth: string;
  ageAtSubmission: number;
  zip: string;
  state: ServiceState;
  timeZone: TimeZone;
  interest: string;
  bestTimeToCall: (typeof CALL_TIMES)[number];
  campaignCode: string | undefined;
  utm: { source?: string; medium?: string; campaign?: string; content?: string };
  trustedFormCertUrl: string | undefined;
  /** Seconds the consumer spent on the form, if known. */
  formFillSeconds: number | undefined;
}

/** Field-level error codes. The UI maps them to English/Spanish messages. */
export type SubmissionErrorCode =
  | "required"
  | "invalid"
  | "invalid_phone"
  | "invalid_date"
  | "age_out_of_range"
  | "out_of_area"
  | "consent_required";

export type SubmissionResult =
  | { kind: "accepted"; lead: NormalizedLead }
  /** Honeypot tripped: pretend success to the bot but store nothing. */
  | { kind: "discarded" }
  | { kind: "invalid"; errors: Partial<Record<string, SubmissionErrorCode>> };

const TRUSTEDFORM_URL = /^https:\/\/cert\.trustedform\.com\/[A-Za-z0-9]+$/;

/** Live, admin-controlled rules for the submission (from the database). */
export interface SubmissionRules {
  minAge: number;
  maxAge: number;
  /** States currently accepting leads. */
  enabledStates: readonly string[];
}

/**
 * Validates and normalizes a landing-page submission. Pure: pass `now` and `rules` in.
 * The caller must already have checked that the line is enabled.
 */
export function parseLeadSubmission(
  raw: unknown,
  now: Date,
  rules: SubmissionRules,
): SubmissionResult {
  const parsed = leadSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Partial<Record<string, SubmissionErrorCode>> = {};
    const rawFields = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
      string,
      unknown
    >;
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (errors[field]) continue;
      const value = rawFields[field];
      const blank = value === undefined || value === null || String(value).trim() === "";
      if (field === "consentGiven") errors[field] = "consent_required";
      else errors[field] = blank ? "required" : "invalid";
    }
    return { kind: "invalid", errors };
  }
  const input = parsed.data;
  if (input.website) return { kind: "discarded" };

  const errors: Partial<Record<string, SubmissionErrorCode>> = {};

  const phoneE164 = normalizeUsPhone(input.phone);
  if (!phoneE164) errors.phone = "invalid_phone";

  const dob = { year: input.birthYear, month: input.birthMonth, day: input.birthDay };
  let age: number | undefined;
  if (!isValidDate(dob)) {
    errors.birthDay = "invalid_date";
  } else {
    age = ageOn(dob, now);
    if (age < rules.minAge || age > rules.maxAge) errors.birthYear = "age_out_of_range";
  }

  if (!LINE_CATALOG[input.line].interestOptions.includes(input.interest)) {
    errors.interest = "invalid";
  }

  const zipArea = lookupZip(input.zip);
  const area = zipArea && rules.enabledStates.includes(zipArea.state) ? zipArea : undefined;
  if (!area) errors.zip = "out_of_area";

  if (!phoneE164 || age === undefined || !area || Object.keys(errors).length > 0) {
    return { kind: "invalid", errors };
  }

  const trustedFormCertUrl =
    input.trustedFormCertUrl && TRUSTEDFORM_URL.test(input.trustedFormCertUrl)
      ? input.trustedFormCertUrl
      : undefined;

  const formFillSeconds =
    input.formStartedAt !== undefined && input.formStartedAt <= now.getTime()
      ? Math.round((now.getTime() - input.formStartedAt) / 1000)
      : undefined;

  return {
    kind: "accepted",
    lead: {
      line: input.line,
      language: input.language,
      consentVersionId: input.consentVersionId,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneE164,
      email: input.email ? normalizeEmail(input.email) : undefined,
      dateOfBirth: toIsoDate(dob),
      ageAtSubmission: age,
      zip: input.zip,
      state: area.state,
      timeZone: area.timeZone,
      interest: input.interest,
      bestTimeToCall: input.bestTimeToCall,
      campaignCode: input.campaignCode,
      utm: {
        source: input.utmSource,
        medium: input.utmMedium,
        campaign: input.utmCampaign,
        content: input.utmContent,
      },
      trustedFormCertUrl,
      formFillSeconds,
    },
  };
}
