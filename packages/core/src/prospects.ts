import { z } from "zod";
import { parseCsv } from "./csv";
import { LANGUAGES, type Language, LINE_CATALOG, LINES, type Line } from "./lines";
import { normalizeUsPhone } from "./phone";

/**
 * Buyer finder (PLAN.md §4.6): prospects are licensed agents, agencies, call centers, and
 * marketing organizations we might sell leads to. This is B2B contact data, not consumer PII.
 */
export const PROSPECT_TYPES = ["agent", "agency", "call_center", "fmo_imo", "other"] as const;
export type ProspectType = (typeof PROSPECT_TYPES)[number];

export const PROSPECT_TYPE_LABELS: Record<ProspectType, string> = {
  agent: "Independent agent",
  agency: "Agency",
  call_center: "Call center",
  fmo_imo: "FMO / IMO",
  other: "Other",
};

/** Pipeline: prospect → contacted → replied → trial sent → paying (or lost at any point). */
export const PROSPECT_STAGES = [
  "prospect",
  "contacted",
  "replied",
  "trial_sent",
  "paying",
  "lost",
] as const;
export type ProspectStage = (typeof PROSPECT_STAGES)[number];

export const PROSPECT_STAGE_LABELS: Record<ProspectStage, string> = {
  prospect: "Prospect",
  contacted: "Contacted",
  replied: "Replied",
  trial_sent: "Trial sent",
  paying: "Paying",
  lost: "Lost",
};

/** All US state codes; prospects may be licensed outside our service area. */
export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Accepts an array or a "FL; GA, TN" style string; uppercases, dedupes, validates. */
const stateList = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => unique(splitList(value).map((s) => s.toUpperCase())))
  .pipe(z.array(z.enum(US_STATES)));

/** Accepts line keys ("long_term_care") or slugs ("long-term-care"). */
const lineList = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) =>
    unique(
      splitList(value).map((item) => {
        const key = item.toLowerCase().replace(/-/g, "_");
        return (
          LINES.find((line) => line === key || LINE_CATALOG[line].slug === item.toLowerCase()) ??
          item
        );
      }),
    ),
  )
  .pipe(z.array(z.enum(LINES)));

const languageList = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => unique(splitList(value).map((s) => s.toLowerCase())))
  .pipe(z.array(z.enum(LANGUAGES)));

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function splitList(value: string | string[] | undefined): string[] {
  const items = Array.isArray(value) ? value : (value ?? "").split(/[;,|]/);
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}

export const prospectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: optionalText(160),
  type: z.enum(PROSPECT_TYPES).default("agent"),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v.toLowerCase() : undefined))
    .pipe(z.email().optional()),
  phone: optionalText(30).refine((v) => v === undefined || normalizeUsPhone(v) !== undefined, {
    message: "Invalid US phone number",
  }),
  website: optionalText(300),
  city: optionalText(100),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.enum(US_STATES).optional()),
  licensedStates: stateList,
  lines: lineList,
  languages: languageList,
  /** National Producer Number. */
  npn: optionalText(20).refine((v) => v === undefined || /^\d{1,10}$/.test(v), {
    message: "NPN must be digits",
  }),
  /** Where we found them, e.g. "FL DFS licensee list", "Facebook group". */
  source: optionalText(120),
  notes: optionalText(2000),
});

export type ProspectInput = z.output<typeof prospectInputSchema>;

/** Readable messages for a failed parse, e.g. ["email: Invalid email address"]. */
export function describeIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`);
}

/** Column headers for CSV import (also the template download). */
export const PROSPECT_CSV_COLUMNS = [
  "name",
  "company",
  "type",
  "email",
  "phone",
  "website",
  "city",
  "state",
  "licensed_states",
  "lines",
  "languages",
  "npn",
  "source",
  "notes",
] as const;

const CSV_TO_FIELD: Record<string, keyof ProspectInput> = {
  name: "name",
  company: "company",
  type: "type",
  email: "email",
  phone: "phone",
  website: "website",
  city: "city",
  state: "state",
  licensed_states: "licensedStates",
  lines: "lines",
  languages: "languages",
  npn: "npn",
  source: "source",
  notes: "notes",
};

export interface CsvImportResult {
  prospects: { row: number; input: ProspectInput }[];
  errors: { row: number; messages: string[] }[];
  unknownColumns: string[];
}

export const MAX_IMPORT_ROWS = 2000;

/** Parses and validates an uploaded prospect CSV. Row numbers are 1-based spreadsheet rows. */
export function parseProspectCsv(text: string): CsvImportResult {
  const [header, ...rows] = parseCsv(text);
  if (!header)
    return { prospects: [], errors: [{ row: 1, messages: ["File is empty"] }], unknownColumns: [] };

  const columns = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const unknownColumns = columns.filter((c) => c && !(c in CSV_TO_FIELD));
  if (!columns.includes("name")) {
    return {
      prospects: [],
      errors: [{ row: 1, messages: ['Missing required column "name"'] }],
      unknownColumns,
    };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      prospects: [],
      errors: [{ row: 1, messages: [`Too many rows (max ${MAX_IMPORT_ROWS} per file)`] }],
      unknownColumns,
    };
  }

  const result: CsvImportResult = { prospects: [], errors: [], unknownColumns };
  rows.forEach((cells, index) => {
    const record: Record<string, string> = {};
    columns.forEach((column, i) => {
      const field = CSV_TO_FIELD[column];
      const value = cells[i]?.trim();
      if (field && value) record[field] = value;
    });
    const parsed = prospectInputSchema.safeParse(record);
    const row = index + 2;
    if (parsed.success) result.prospects.push({ row, input: parsed.data });
    else result.errors.push({ row, messages: describeIssues(parsed.error) });
  });
  return result;
}

/** ISO date (YYYY-MM-DD) `days` after `from`, in UTC. */
export function addDays(from: Date, days: number): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + days));
  return d.toISOString().slice(0, 10);
}

/** Default wait before following up after an outreach email. */
export const FOLLOW_UP_DAYS = 4;

export function isFollowUpDue(nextFollowUpOn: string | null, today: Date): boolean {
  return nextFollowUpOn !== null && nextFollowUpOn <= addDays(today, 0);
}

/** Context for writing an outreach email (used by the AI writer and the template fallback). */
export interface OutreachContext {
  prospect: {
    name: string;
    company?: string;
    type: ProspectType;
    licensedStates: string[];
    lines: Line[];
    languages: Language[];
    notes?: string;
  };
  /** Product lines the business currently sells. */
  offeredLines: Line[];
  /** States currently accepting leads. */
  serviceStates: string[];
  senderName: string;
  businessName: string;
  /** 1 = first email, 2+ = follow-ups. */
  touch: number;
  language: Language;
}

export interface OutreachDraft {
  subject: string;
  body: string;
}

/** Lines worth pitching: the prospect's lines that we offer, else everything we offer. */
export function linesToPitch(ctx: OutreachContext): Line[] {
  const overlap = ctx.prospect.lines.filter((line) => ctx.offeredLines.includes(line));
  return overlap.length > 0 ? overlap : ctx.offeredLines;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function joinList(items: string[], and: string): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items.at(-1)}`;
}

/** Deterministic outreach draft, used when no AI writer is configured or it fails. */
export function templateOutreachDraft(ctx: OutreachContext): OutreachDraft {
  const products = linesToPitch(ctx).map((line) => LINE_CATALOG[line].names[ctx.language]);
  const states = ctx.prospect.licensedStates.filter((s) => ctx.serviceStates.includes(s));
  const stateText = joinList(
    states.length > 0 ? states : ctx.serviceStates,
    ctx.language === "es" ? "y" : "and",
  );
  const spanish = ctx.prospect.languages.includes("es");
  const name = firstName(ctx.prospect.name);

  if (ctx.language === "es") {
    const subject =
      ctx.touch > 1
        ? `Seguimiento: prospectos de ${products[0] ?? "seguros"}`
        : `Prospectos de ${products[0] ?? "seguros"} en ${stateText}`;
    const body = [
      `Hola ${name}:`,
      "",
      ctx.touch > 1
        ? "Le escribo de nuevo por si no vio mi mensaje anterior."
        : `Soy ${ctx.senderName}, de ${ctx.businessName}. Generamos prospectos de personas mayores que pidieron información sobre ${joinList(products, "y")} en ${stateText}.`,
      "Cada prospecto incluye un certificado de consentimiento (TrustedForm) y puede ser exclusivo o compartido." +
        (spanish ? " También tenemos prospectos que prefieren hablar en español." : ""),
      "¿Le interesaría probar un pequeño lote de prospectos para ver la calidad?",
      "",
      "Saludos,",
      ctx.senderName,
    ].join("\n");
    return { subject, body };
  }

  const subject =
    ctx.touch > 1
      ? `Following up: ${products[0] ?? "insurance"} leads`
      : `${capitalize(products[0] ?? "insurance")} leads in ${stateText}`;
  const body = [
    `Hi ${name},`,
    "",
    ctx.touch > 1
      ? "Following up in case my last note got buried."
      : `I'm ${ctx.senderName} with ${ctx.businessName}. We generate leads from seniors who asked to learn about ${joinList(products, "and")} in ${stateText}.`,
    "Every lead comes with a TrustedForm consent certificate, and you can buy them exclusive or shared." +
      (spanish ? " We also have Spanish-speaking leads." : ""),
    "Would you be open to trying a small trial batch to see the quality for yourself?",
    "",
    "Thanks,",
    ctx.senderName,
  ].join("\n");
  return { subject, body };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** CAN-SPAM footer appended to every outreach email: identity, postal address, opt-out. */
export function outreachFooter(input: {
  businessName: string;
  mailingAddress: string;
  language: Language;
}): string {
  return input.language === "es"
    ? `—\n${input.businessName} · ${input.mailingAddress}\nSi no desea recibir más correos, responda "no más correos" y no le escribiremos de nuevo.`
    : `—\n${input.businessName} · ${input.mailingAddress}\nIf you'd rather not hear from us, reply "unsubscribe" and we won't email you again.`;
}

/** Validates a draft from any writer (AI output is untrusted until checked). */
export const outreachDraftSchema = z.object({
  subject: z.string().trim().min(3).max(150),
  body: z.string().trim().min(20).max(3000),
});
