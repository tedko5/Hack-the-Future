import { useEffect, useRef } from 'react'
import { formatDateTime } from '#/lib/formatDate.ts'
import type { Message } from '#/lib/message.ts'

type Props = {
  messages: Message[]
  /** The signed-in guardian, whose messages are on the right. */
  guardianId: string
}

export function MessageThread({ messages, guardianId }: Props) {
  const list = useRef<HTMLOListElement>(null)
  const lastId = messages.at(-1)?.messageId

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [lastId])

  return (
    <ol
      ref={list}
      aria-live="polite"
      className="flex h-[min(55vh,460px)] flex-col gap-3 overflow-y-auto rounded-xl border-2 border-edge bg-well p-4"
    >
      {messages.length === 0 && <li className="text-muted">No messages yet.</li>}
      {messages.map((message) => {
        const isMine = message.senderId === guardianId
        return (
          <li
            key={message.messageId}
            className={`max-w-[85%] rounded-xl px-3.5 py-2 ${isMine ? 'self-end bg-edge' : 'self-start bg-panel'}`}
          >
            <p className="flex flex-wrap items-baseline gap-x-3 text-[.8rem] text-[#c9cff0]">
              <b>{isMine ? 'You' : message.senderCodename}</b>
              <time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
            </p>
            <p className="leading-snug break-words whitespace-pre-wrap">{message.body}</p>
          </li>
        )
      })}
    </ol>
  )
}
