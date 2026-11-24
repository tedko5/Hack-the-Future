import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ConversationList } from '#/components/messages/ConversationList.tsx'
import { MessageForm } from '#/components/messages/MessageForm.tsx'
import { MessageThread } from '#/components/messages/MessageThread.tsx'
import { getConversation, markRead } from '#/lib/messages.functions.ts'

export const Route = createFileRoute('/_app/messages/$conversationId')({
  loader: ({ params }) => getConversation({ data: params }),
  component: MessagesPage,
  notFoundComponent: () => (
    <p className="rounded-[18px] bg-panel p-6">That conversation does not exist.</p>
  ),
})

function MessagesPage() {
  const { conversations, current, messages } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const router = useRouter()
  const { conversationId, title, unread } = current
  const lastId = messages.at(-1)?.messageId

  // Reading a conversation marks it read, also when a message arrives while it is open.
  useEffect(() => {
    if (unread === 0 || lastId === undefined) return
    markRead({ data: { conversationId, messageId: lastId } })
      .then(() => router.invalidate())
      .catch(console.error)
  }, [conversationId, lastId, unread, router])

  return (
    <section
      aria-labelledby="conversation-title"
      className="grid gap-4 rounded-[18px] bg-panel p-3 md:grid-cols-[13rem_minmax(0,1fr)] md:p-4.5"
    >
      <ConversationList conversations={conversations} />
      <div className="flex min-w-0 flex-col gap-4">
        <h2 id="conversation-title" className="font-display text-[1.6rem] font-bold">
          {title}
        </h2>
        <MessageThread key={conversationId} messages={messages} guardianId={guardian.guardianId} />
        {/* Keyed so a draft never moves to another conversation. */}
        <MessageForm key={`form-${conversationId}`} conversationId={conversationId} title={title} />
      </div>
    </section>
  )
}
