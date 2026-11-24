CREATE SEQUENCE "public"."glitch_number" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 143 CACHE 1;--> statement-breakpoint
CREATE TABLE "echoes" (
	"echo_id" serial PRIMARY KEY NOT NULL,
	"glitch_id" text NOT NULL,
	"description" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"reporting_guardian_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "echoes" ADD CONSTRAINT "echoes_glitch_id_glitches_glitch_id_fk" FOREIGN KEY ("glitch_id") REFERENCES "public"."glitches"("glitch_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "echoes" ADD CONSTRAINT "echoes_reporting_guardian_id_guardians_guardian_id_fk" FOREIGN KEY ("reporting_guardian_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "echoes_glitch_id" ON "echoes" USING btree ("glitch_id");