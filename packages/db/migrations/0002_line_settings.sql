CREATE TABLE "insurance_lines" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_states" (
	"state" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ALTER COLUMN "line" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "consent_versions" ALTER COLUMN "line" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "line" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "coverage_amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "interest" text;--> statement-breakpoint
-- Data migration (hand-written): register line keys already in use so the foreign keys hold,
-- and carry the old coverage answer over to the new generic "interest" column.
-- The seed script fills in the full catalog; existing lines start switched off.
INSERT INTO "insurance_lines" ("key", "enabled", "min_age", "max_age")
  SELECT DISTINCT "line", false, 50, 85 FROM (
    SELECT "line" FROM "campaigns" UNION SELECT "line" FROM "consent_versions" UNION SELECT "line" FROM "leads"
  ) AS used
  ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "leads" SET "interest" = "coverage_amount" WHERE "interest" IS NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_line_insurance_lines_key_fk" FOREIGN KEY ("line") REFERENCES "public"."insurance_lines"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_versions" ADD CONSTRAINT "consent_versions_line_insurance_lines_key_fk" FOREIGN KEY ("line") REFERENCES "public"."insurance_lines"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_line_insurance_lines_key_fk" FOREIGN KEY ("line") REFERENCES "public"."insurance_lines"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."insurance_line";