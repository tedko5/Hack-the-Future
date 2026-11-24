import { useEffect, useRef } from 'react'
import { MessageItem } from '#/components/messages/MessageItem.tsx'
import type { Message } from '#/lib/message.ts'

type Props = {
  messages: Message[]
  emptyMessage: string
  /** The signed-in guardian, whose messages are on the right. */
  guardianId: string
  onReply: (message: Message) => void
}

export function MessageThread({ messages, emptyMessage, guardianId, onReply }: Props) {
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
      {messages.length === 0 && <li className="text-muted">{emptyMessage}</li>}
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
