-- Tells the participants of a message that its reactions changed.
CREATE FUNCTION notify_reaction() RETURNS trigger AS $$
BEGIN
	PERFORM pg_notify('live_events', json_build_object(
		'type', 'message',
		'senderId', m.sender_id,
		'recipientId', m.recipient_id
	)::text)
	FROM messages m
	WHERE m.message_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.message_id ELSE NEW.message_id END;
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER message_reactions_live_events AFTER INSERT OR DELETE ON "message_reactions"
	FOR EACH ROW EXECUTE FUNCTION notify_reaction();
