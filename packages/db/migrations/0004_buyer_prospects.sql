CREATE TYPE "public"."prospect_activity_type" AS ENUM('created', 'imported', 'note', 'call', 'email_sent', 'stage_change', 'do_not_contact', 'trial');--> statement-breakpoint
CREATE TYPE "public"."prospect_stage" AS ENUM('prospect', 'contacted', 'replied', 'trial_sent', 'paying', 'lost');--> statement-breakpoint
CREATE TYPE "public"."prospect_type" AS ENUM('agent', 'agency', 'call_center', 'fmo_imo', 'other');--> statement-breakpoint
CREATE TABLE "buyer_prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"type" "prospect_type" NOT NULL,
	"email" text,
	"phone" text,
	"website" text,
	"city" text,
	"state" text,
	"licensed_states" text[] DEFAULT '{}'::text[] NOT NULL,
	"lines" text[] DEFAULT '{}'::text[] NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"npn" text,
	"source" text,
	"notes" text,
	"stage" "prospect_stage" DEFAULT 'prospect' NOT NULL,
	"next_follow_up_on" date,
	"last_contacted_at" timestamp with time zone,
	"do_not_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospect_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prospect_id" uuid NOT NULL,
	"type" "prospect_activity_type" NOT NULL,
	"summary" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"actor" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_prospect_id_buyer_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."buyer_prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "buyer_prospects_email_unique" ON "buyer_prospects" USING btree (lower("email")) WHERE "buyer_prospects"."email" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "buyer_prospects_npn_unique" ON "buyer_prospects" USING btree ("npn") WHERE "buyer_prospects"."npn" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "buyer_prospects_stage" ON "buyer_prospects" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "buyer_prospects_follow_up" ON "buyer_prospects" USING btree ("next_follow_up_on");--> statement-breakpoint
CREATE INDEX "prospect_activities_prospect" ON "prospect_activities" USING btree ("prospect_id","created_at");