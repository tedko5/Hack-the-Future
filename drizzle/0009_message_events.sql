-- Tells the server about new messages. The payload names the participants, never the text.
CREATE FUNCTION notify_message() RETURNS trigger AS $$
BEGIN
	PERFORM pg_notify('live_events', json_build_object(
		'type', 'message',
		'senderId', NEW.sender_id,
		'recipientId', NEW.recipient_id
	)::text);
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER messages_live_events AFTER INSERT ON "messages"
	FOR EACH ROW EXECUTE FUNCTION notify_message();
