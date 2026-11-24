CREATE TABLE "conversation_reads" (
	"guardian_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"last_read_message_id" integer NOT NULL,
	CONSTRAINT "conversation_reads_guardian_id_conversation_id_pk" PRIMARY KEY("guardian_id","conversation_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation_reads" ADD CONSTRAINT "conversation_reads_guardian_id_guardians_guardian_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_guardians_guardian_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_guardians_guardian_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_participants" ON "messages" USING btree ("recipient_id","sender_id","message_id");