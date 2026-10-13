/**
 * Database schema (PLAN.md §5). Phase 0 subset: lead capture, consent, suppression, audit.
 * Change only through migrations: edit this file, then run `pnpm db:generate`.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const languageEnum = pgEnum("language", ["en", "es"]);
export const supplierTypeEnum = pgEnum("supplier_type", ["owner", "external"]);
export const sourceChannelEnum = pgEnum("source_channel", [
  "landing_page",
  "ad_platform",
  "affiliate",
  "mailer",
  "email",
  "inbound_call",
  "manual",
]);
/** Lead lifecycle (PLAN.md §5). Later phases add offered/sold/aged states. */
export const leadStatusEnum = pgEnum("lead_status", [
  "received",
  "ready",
  "rejected",
  "suppressed",
]);

/**
 * Admin-controlled settings per product line (PLAN.md §4.7). Which lines exist is defined in
 * code (`LINE_CATALOG` in @cp/core); whether each is offered, and its age range, lives here.
 */
export const insuranceLines = pgTable("insurance_lines", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  minAge: integer("min_age").notNull(),
  maxAge: integer("max_age").notNull(),
  updatedAt: updatedAt(),
});

/** Admin-controlled geographic markets: states currently accepting leads. */
export const serviceStates = pgTable("service_states", {
  state: text("state").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: updatedAt(),
});

export const suppliers = pgTable("suppliers", {
  id: id(),
  name: text("name").notNull(),
  type: supplierTypeEnum("type").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sources = pgTable("sources", {
  id: id(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  channel: sourceChannelEnum("channel").notNull(),
  name: text("name").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const campaigns = pgTable("campaigns", {
  id: id(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id),
  /** Short code carried in URLs/QR codes (?c=CODE). */
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  line: text("line")
    .notNull()
    .references(() => insuranceLines.key),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * Consent disclosure text. `text` is immutable once inserted (DB trigger);
 * to change wording, insert a new version. Only `active` and `counsel_approved_at` may change.
 */
export const consentVersions = pgTable(
  "consent_versions",
  {
    id: id(),
    line: text("line")
      .notNull()
      .references(() => insuranceLines.key),
    language: languageEnum("language").notNull(),
    version: integer("version").notNull(),
    text: text("text").notNull(),
    counselApprovedAt: timestamp("counsel_approved_at", { withTimezone: true }),
    active: boolean("active").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("consent_versions_line_language_version").on(t.line, t.language, t.version),
    // At most one active version per line + language.
    uniqueIndex("consent_versions_one_active").on(t.line, t.language).where(sql`${t.active}`),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: id(),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id),
    campaignId: uuid("campaign_id").references(() => campaigns.id),
    line: text("line")
      .notNull()
      .references(() => insuranceLines.key),
    language: languageEnum("language").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phoneE164: text("phone_e164").notNull(),
    phoneHash: text("phone_hash").notNull(),
    email: text("email"),
    emailHash: text("email_hash"),
    dateOfBirth: date("date_of_birth").notNull(),
    ageAtSubmission: integer("age_at_submission").notNull(),
    zip: text("zip").notNull(),
    state: text("state").notNull(),
    timeZone: text("time_zone").notNull(),
    /** Answer to the line's qualifying question (see LINE_CATALOG interestOptions). */
    interest: text("interest").notNull(),
    bestTimeToCall: text("best_time_to_call").notNull(),
    utm: jsonb("utm").$type<Record<string, string | undefined>>().notNull().default({}),
    formFillSeconds: integer("form_fill_seconds"),
    status: leadStatusEnum("status").notNull().default("received"),
    statusReason: text("status_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("leads_phone_hash").on(t.phoneHash),
    index("leads_created_at").on(t.createdAt),
    index("leads_campaign_id").on(t.campaignId),
  ],
);

/** Exact record of what the consumer agreed to. Immutable (DB trigger blocks UPDATE/DELETE). */
export const consentSnapshots = pgTable("consent_snapshots", {
  id: id(),
  leadId: uuid("lead_id")
    .notNull()
    .unique()
    .references(() => leads.id),
  consentVersionId: uuid("consent_version_id")
    .notNull()
    .references(() => consentVersions.id),
  renderedText: text("rendered_text").notNull(),
  language: languageEnum("language").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  pageUrl: text("page_url"),
  trustedFormCertUrl: text("trusted_form_cert_url"),
  jornayaLeadId: text("jornaya_lead_id"),
  createdAt: createdAt(),
});

/** Consumers who must never be sold or contacted. Matched by keyed hash, not raw PII. */
export const suppressions = pgTable(
  "suppressions",
  {
    id: id(),
    phoneHash: text("phone_hash"),
    emailHash: text("email_hash"),
    reason: text("reason").notNull(),
    source: text("source").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("suppressions_phone_hash").on(t.phoneHash),
    index("suppressions_email_hash").on(t.emailHash),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [index("audit_log_created_at").on(t.createdAt)],
);
