-- Tells the server about every change, whoever made it. The payload holds no content.
CREATE FUNCTION notify_live_events() RETURNS trigger AS $$
BEGIN
	PERFORM pg_notify('live_events', json_build_object(
		'type', TG_ARGV[0],
		'glitchId', CASE WHEN TG_OP = 'DELETE' THEN OLD.glitch_id ELSE NEW.glitch_id END
	)::text);
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER glitches_live_events AFTER INSERT OR UPDATE OR DELETE ON "glitches"
	FOR EACH ROW EXECUTE FUNCTION notify_live_events('glitch');--> statement-breakpoint
CREATE TRIGGER echoes_live_events AFTER INSERT OR UPDATE OR DELETE ON "echoes"
	FOR EACH ROW EXECUTE FUNCTION notify_live_events('echo');
