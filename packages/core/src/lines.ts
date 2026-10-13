/**
 * Catalog of insurance product lines the platform knows how to sell (PLAN.md D1).
 *
 * Focus: products for people 50+ that pay benefits while the person is alive
 * (care, illness, hospital, health-cost gaps). Final expense (burial) remains available but is
 * off by default.
 *
 * This file defines WHAT a line is (slug, form question, defaults). WHETHER a line is offered,
 * and its live age range, is data in the `insurance_lines` table, edited in the admin console.
 * Adding a new line = add it here + copy in apps/web/src/lib/messages + seed (see runbook).
 */
export const LINES = [
  "long_term_care",
  "home_health_care",
  "critical_illness",
  "hospital_indemnity",
  "life_living_benefits",
  "dental_vision_hearing",
  "medicare_supplement",
  "final_expense",
] as const;
export type Line = (typeof LINES)[number];

export interface LineDefinition {
  /** URL slug used by landing pages, e.g. /en/long-term-care */
  slug: string;
  /** Product name as used mid-sentence (consent text, emails, admin). */
  names: { en: string; es: string };
  defaultMinAge: number;
  defaultMaxAge: number;
  /** Whether the line is switched on when first seeded. */
  defaultEnabled: boolean;
  /**
   * Allowed answers to the line's single qualifying question. Labels live in the message files.
   * Never ask about health conditions here: that is sensitive data we do not want to hold.
   */
  interestOptions: readonly string[];
  /** Lines with extra regulation (e.g. Medicare marketing rules) need counsel sign-off first. */
  extraLegalReview: boolean;
}

const CARE_PLANNING = ["planning_ahead", "comparing_options", "for_me_and_spouse"] as const;

export const LINE_CATALOG: Record<Line, LineDefinition> = {
  long_term_care: {
    slug: "long-term-care",
    names: { en: "long-term care insurance", es: "seguro de cuidado a largo plazo" },
    defaultMinAge: 50,
    defaultMaxAge: 79,
    defaultEnabled: true,
    interestOptions: CARE_PLANNING,
    extraLegalReview: false,
  },
  home_health_care: {
    slug: "home-health-care",
    names: { en: "home health care insurance", es: "seguro de cuidado de salud en el hogar" },
    defaultMinAge: 60,
    defaultMaxAge: 89,
    defaultEnabled: true,
    interestOptions: CARE_PLANNING,
    extraLegalReview: false,
  },
  critical_illness: {
    slug: "critical-illness",
    names: { en: "critical illness insurance", es: "seguro de enfermedades graves" },
    defaultMinAge: 50,
    defaultMaxAge: 80,
    defaultEnabled: true,
    interestOptions: ["10000", "25000", "50000", "100000"],
    extraLegalReview: false,
  },
  hospital_indemnity: {
    slug: "hospital-indemnity",
    names: { en: "hospital indemnity insurance", es: "seguro de indemnización hospitalaria" },
    defaultMinAge: 50,
    defaultMaxAge: 89,
    defaultEnabled: true,
    interestOptions: ["high_out_of_pocket_costs", "planning_ahead", "not_sure"],
    extraLegalReview: false,
  },
  life_living_benefits: {
    slug: "life-insurance-living-benefits",
    names: {
      en: "life insurance with living benefits",
      es: "seguro de vida con beneficios en vida",
    },
    defaultMinAge: 50,
    defaultMaxAge: 85,
    defaultEnabled: true,
    interestOptions: ["25000", "50000", "100000", "250000"],
    extraLegalReview: false,
  },
  dental_vision_hearing: {
    slug: "dental-vision-hearing",
    names: {
      en: "dental, vision, and hearing insurance",
      es: "seguro dental, de visión y de audición",
    },
    defaultMinAge: 50,
    defaultMaxAge: 89,
    defaultEnabled: true,
    interestOptions: ["dental", "vision", "hearing", "all_three"],
    extraLegalReview: false,
  },
  medicare_supplement: {
    slug: "medicare-supplement",
    names: { en: "Medicare Supplement insurance", es: "seguro suplementario de Medicare" },
    defaultMinAge: 64,
    defaultMaxAge: 89,
    defaultEnabled: false,
    interestOptions: ["turning_65", "already_on_medicare"],
    extraLegalReview: true,
  },
  final_expense: {
    slug: "final-expense",
    names: { en: "final expense insurance", es: "seguro de gastos finales" },
    defaultMinAge: 50,
    defaultMaxAge: 85,
    defaultEnabled: false,
    interestOptions: ["5000", "10000", "15000", "25000", "50000"],
    extraLegalReview: false,
  },
};

/** Live settings for a line, read from the database. */
export interface LineSettings {
  line: Line;
  enabled: boolean;
  minAge: number;
  maxAge: number;
}

export const AGE_LIMITS = { min: 18, max: 100 } as const;

/** Validates admin edits to a line's age range. Returns an error message or undefined. */
export function validateAgeRange(minAge: number, maxAge: number): string | undefined {
  if (!Number.isInteger(minAge) || !Number.isInteger(maxAge)) return "Ages must be whole numbers";
  if (minAge < AGE_LIMITS.min || maxAge > AGE_LIMITS.max)
    return `Ages must be between ${AGE_LIMITS.min} and ${AGE_LIMITS.max}`;
  if (minAge > maxAge) return "Minimum age must not be greater than maximum age";
  return undefined;
}

export const LANGUAGES = ["en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function isLine(value: string): value is Line {
  return (LINES as readonly string[]).includes(value);
}

export function lineFromSlug(slug: string): Line | undefined {
  return LINES.find((line) => LINE_CATALOG[line].slug === slug);
}
