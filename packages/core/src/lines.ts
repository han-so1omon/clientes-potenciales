/**
 * Insurance product lines. Phase 0 only sells final expense (PLAN.md D1).
 * Age limits are product eligibility, reviewed with buyers; prices live in the database.
 */
export const LINES = ["final_expense"] as const;
export type Line = (typeof LINES)[number];

export interface LineConfig {
  /** URL slug used by landing pages, e.g. /en/final-expense */
  slug: string;
  minAge: number;
  maxAge: number;
}

export const LINE_CONFIG: Record<Line, LineConfig> = {
  final_expense: { slug: "final-expense", minAge: 50, maxAge: 85 },
};

export const LANGUAGES = ["en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function lineFromSlug(slug: string): Line | undefined {
  return LINES.find((line) => LINE_CONFIG[line].slug === slug);
}
