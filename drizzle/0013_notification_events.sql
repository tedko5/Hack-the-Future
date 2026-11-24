-- Tells only the recipient that their notifications changed.
CREATE FUNCTION notify_notification() RETURNS trigger AS $$
BEGIN
	PERFORM pg_notify('live_events', json_build_object(
		'type', 'notification',
		'guardianId', CASE WHEN TG_OP = 'DELETE' THEN OLD.guardian_id ELSE NEW.guardian_id END
	)::text);
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER notifications_live_events AFTER INSERT OR UPDATE OR DELETE ON "notifications"
	FOR EACH ROW EXECUTE FUNCTION notify_notification();
