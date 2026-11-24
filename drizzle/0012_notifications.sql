CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"guardian_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"type" text NOT NULL,
	"glitch_id" text,
	"message_id" integer,
	"conversation_id" text,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_guardian_id_guardians_guardian_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_guardians_guardian_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_glitch_id_glitches_glitch_id_fk" FOREIGN KEY ("glitch_id") REFERENCES "public"."glitches"("glitch_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_guardian" ON "notifications" USING btree ("guardian_id","notification_id");