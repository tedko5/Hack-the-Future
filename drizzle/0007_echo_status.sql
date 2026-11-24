ALTER TABLE "echoes" ADD COLUMN "status" text;--> statement-breakpoint
-- Existing echoes: the last recorded change up to that echo. Before the first recorded
-- change a glitch was leaked; without any recorded change only its current status is known.
UPDATE "echoes" e SET "status" = coalesce(
	(SELECT p."new_status" FROM "echoes" p
		WHERE p."glitch_id" = e."glitch_id" AND p."new_status" IS NOT NULL
			AND (p."timestamp", p."echo_id") <= (e."timestamp", e."echo_id")
		ORDER BY p."timestamp" DESC, p."echo_id" DESC LIMIT 1),
	(SELECT 'LEAKED' FROM "echoes" p WHERE p."glitch_id" = e."glitch_id" AND p."new_status" IS NOT NULL LIMIT 1),
	(SELECT g."status" FROM "glitches" g WHERE g."glitch_id" = e."glitch_id")
);
