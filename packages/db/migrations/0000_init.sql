CREATE TYPE "public"."language" AS ENUM('en', 'es');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('received', 'ready', 'rejected', 'suppressed');--> statement-breakpoint
CREATE TYPE "public"."insurance_line" AS ENUM('final_expense');--> statement-breakpoint
CREATE TYPE "public"."source_channel" AS ENUM('landing_page', 'ad_platform', 'affiliate', 'mailer', 'email', 'inbound_call', 'manual');--> statement-breakpoint
CREATE TYPE "public"."supplier_type" AS ENUM('owner', 'external');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"line" "insurance_line" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "consent_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"consent_version_id" uuid NOT NULL,
	"rendered_text" text NOT NULL,
	"language" "language" NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"page_url" text,
	"trusted_form_cert_url" text,
	"jornaya_lead_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consent_snapshots_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
CREATE TABLE "consent_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line" "insurance_line" NOT NULL,
	"language" "language" NOT NULL,
	"version" integer NOT NULL,
	"text" text NOT NULL,
	"counsel_approved_at" timestamp with time zone,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"campaign_id" uuid,
	"line" "insurance_line" NOT NULL,
	"language" "language" NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_e164" text NOT NULL,
	"phone_hash" text NOT NULL,
	"email" text,
	"email_hash" text,
	"date_of_birth" date NOT NULL,
	"age_at_submission" integer NOT NULL,
	"zip" text NOT NULL,
	"state" text NOT NULL,
	"time_zone" text NOT NULL,
	"coverage_amount" text NOT NULL,
	"best_time_to_call" text NOT NULL,
	"utm" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"form_fill_seconds" integer,
	"status" "lead_status" DEFAULT 'received' NOT NULL,
	"status_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"channel" "source_channel" NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "supplier_type" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_hash" text,
	"email_hash" text,
	"reason" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_snapshots" ADD CONSTRAINT "consent_snapshots_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_snapshots" ADD CONSTRAINT "consent_snapshots_consent_version_id_consent_versions_id_fk" FOREIGN KEY ("consent_version_id") REFERENCES "public"."consent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_created_at" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "consent_versions_line_language_version" ON "consent_versions" USING btree ("line","language","version");--> statement-breakpoint
CREATE UNIQUE INDEX "consent_versions_one_active" ON "consent_versions" USING btree ("line","language") WHERE "consent_versions"."active";--> statement-breakpoint
CREATE INDEX "leads_phone_hash" ON "leads" USING btree ("phone_hash");--> statement-breakpoint
CREATE INDEX "leads_created_at" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_campaign_id" ON "leads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "suppressions_phone_hash" ON "suppressions" USING btree ("phone_hash");--> statement-breakpoint
CREATE INDEX "suppressions_email_hash" ON "suppressions" USING btree ("email_hash");