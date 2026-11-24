CREATE TABLE "guardians" (
	"guardian_id" text PRIMARY KEY NOT NULL,
	"codename" text NOT NULL,
	"role" text DEFAULT 'defender' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "guardians_codename_lower" ON "guardians" USING btree (lower("codename"));