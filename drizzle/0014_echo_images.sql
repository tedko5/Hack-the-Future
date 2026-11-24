CREATE TABLE "echo_images" (
	"echo_id" integer PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "echo_images" ADD CONSTRAINT "echo_images_echo_id_echoes_echo_id_fk" FOREIGN KEY ("echo_id") REFERENCES "public"."echoes"("echo_id") ON DELETE no action ON UPDATE no action;