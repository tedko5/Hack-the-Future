import { Reply, SmilePlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog.tsx'
import { MessageReactions, ReactionPicker, useToggleReaction } from '#/components/messages/Reactions.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import type { Dictionary } from '#/i18n/en.ts'
import type { Message, MessageQuote } from '#/lib/message.ts'
import { deleteMessage } from '#/lib/messages.functions.ts'

type Props = {
  message: Message
  isMine: boolean
  onReply: () => void
}

const elementId = (messageId: number) => `message-${messageId}`

const actionClass =
  'flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-highlight'

/** The text that stands for a message in a quote. */
export function quoteText({ body, isDeleted }: MessageQuote, t: Dictionary) {
  return isDeleted ? t.messages.deleted : body || t.messages.image
}

export function MessageItem({ message, isMine, onReply }: Props) {
  const t = useT()
  const format = useFormat()
  const [isPicking, setIsPicking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const toggle = useToggleReaction(message.messageId)
  const { replyTo } = message
  const quote = replyTo && quoteText(replyTo, t)

  return (
    <li
      id={elementId(message.messageId)}
      className={`flex max-w-[85%] flex-col gap-1 ${isMine ? 'items-end self-end' : 'items-start self-start'}`}
    >
      <div className={`flex max-w-full items-center gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
        <div className={`min-w-0 rounded-xl px-3.5 py-2 ${isMine ? 'bg-bubble' : 'bg-panel'}`}>
          <p className="flex flex-wrap items-baseline gap-x-3 text-[.8rem] text-soft">
            <b>
              {isMine ? (
                t.common.you
              ) : (
                <GuardianLink guardianId={message.senderId} codename={message.senderCodename} />
              )}
            </b>
            <time dateTime={message.createdAt}>{format.dateTime(message.createdAt)}</time>
          </p>
          {replyTo && (
            <button
              type="button"
              className="mt-1 block w-full cursor-pointer truncate rounded-md border-l-4 border-violet bg-black/10 px-2 py-1 text-left text-[.85rem] text-soft"
              onClick={() =>
                document
                  .getElementById(elementId(replyTo.messageId))
                  ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
              }
            >
              <b>{replyTo.senderCodename}</b> {quote}
            </button>
          )}
          {message.hasImage && (
            <a
              href={`/api/message-images/${message.messageId}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 block"
            >
              {/* Fixed height, so the thread does not jump when the image loads. */}
              <img
                src={`/api/message-images/${message.messageId}`}
                alt={t.messages.imageBy(message.senderCodename)}
                className="h-48 max-w-full rounded-lg object-contain"
              />
            </a>
          )}
          {message.isDeleted && <p className="text-soft italic">{t.messages.deleted}</p>}
          {message.body && (
            <p className="leading-snug break-words whitespace-pre-wrap">{message.body}</p>
          )}
        </div>
        {!message.isDeleted && (
          <>
            <button type="button" className={actionClass} aria-label={t.messages.reply} title={t.messages.reply} onClick={onReply}>
              <Reply size={18} />
            </button>
            <button
              type="button"
              className={actionClass}
              aria-label={t.messages.react}
              title={t.messages.react}
              aria-expanded={isPicking}
              onClick={() => setIsPicking(!isPicking)}
            >
              <SmilePlus size={18} />
            </button>
            {isMine && (
              <button
                type="button"
                className={actionClass}
                aria-label={t.messages.delete}
                title={t.messages.delete}
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 size={18} />
              </button>
            )}
          </>
        )}
      </div>
      {isDeleting && (
        <ConfirmDialog
          title={t.messages.deleteTitle}
          warning={t.messages.deleteWarning}
          confirmLabel={t.messages.delete}
          onConfirm={() => deleteMessage({ data: { messageId: message.messageId } })}
          onClose={() => setIsDeleting(false)}
        />
      )}
      {isPicking && (
        <ReactionPicker
          onPick={(emoji) => {
            toggle.mutate(emoji)
            setIsPicking(false)
          }}
        />
      )}
      <MessageReactions reactions={message.reactions} onToggle={(emoji) => toggle.mutate(emoji)} />
    </li>
  )
}
