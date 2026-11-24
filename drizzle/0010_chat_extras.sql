CREATE TABLE "message_images" (
	"message_id" integer PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"message_id" integer NOT NULL,
	"guardian_id" text NOT NULL,
	"emoji" text NOT NULL,
	CONSTRAINT "message_reactions_message_id_guardian_id_emoji_pk" PRIMARY KEY("message_id","guardian_id","emoji")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reply_to_id" integer;--> statement-breakpoint
ALTER TABLE "message_images" ADD CONSTRAINT "message_images_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_guardian_id_guardians_guardian_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."guardians"("guardian_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_message_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("message_id") ON DELETE no action ON UPDATE no action;