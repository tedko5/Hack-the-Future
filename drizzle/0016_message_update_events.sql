-- A deleted message has to disappear from open chats as well.
CREATE TRIGGER messages_update_live_events AFTER UPDATE ON "messages"
	FOR EACH ROW EXECUTE FUNCTION notify_message();
