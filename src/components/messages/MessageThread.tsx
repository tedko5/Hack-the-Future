import { useEffect, useLayoutEffect, useRef } from 'react'
import { MessageItem } from '#/components/messages/MessageItem.tsx'
import { useT } from '#/i18n/index.ts'
import type { Message } from '#/lib/schemas/message.ts'

type Props = {
  messages: Message[]
  emptyMessage: string
  /** The signed-in guardian, whose messages are on the right. */
  guardianId: string
  onReply: (message: Message) => void
  /** Only when there are older messages. */
  onShowOlder?: () => void
}

export function MessageThread({
  messages,
  emptyMessage,
  guardianId,
  onReply,
  onShowOlder,
}: Props) {
  const t = useT()
  const list = useRef<HTMLOListElement>(null)
  const lastId = messages.at(-1)?.messageId

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [lastId])

  // Older messages appear above: keep what was being read in place.
  const firstId = messages[0]?.messageId
  const distanceToEnd = useRef<number>(null)
  useLayoutEffect(() => {
    if (!list.current || distanceToEnd.current === null) return
    list.current.scrollTop = list.current.scrollHeight - distanceToEnd.current
    distanceToEnd.current = null
  }, [firstId])

  return (
    <ol
      ref={list}
      aria-live="polite"
      className="flex h-[min(55vh,460px)] flex-col gap-3 overflow-y-auto rounded-xl border-2 border-edge bg-well p-4"
    >
      {messages.length === 0 && <li className="text-muted">{emptyMessage}</li>}
      {onShowOlder && (
        <li className="text-center">
          <button
            type="button"
            className="clickable min-h-11 cursor-pointer px-4 text-sm text-muted hover:text-highlight"
            onClick={() => {
              if (list.current) {
                distanceToEnd.current = list.current.scrollHeight - list.current.scrollTop
              }
              onShowOlder()
            }}
          >
            {t.messages.showOlder}
          </button>
        </li>
      )}
      {messages.map((message) => (
        <MessageItem
          key={message.messageId}
          message={message}
          isMine={message.senderId === guardianId}
          onReply={() => onReply(message)}
        />
      ))}
    </ol>
  )
}
