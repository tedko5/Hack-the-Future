import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ConversationList } from '#/components/messages/ConversationList.tsx'
import { MessageForm } from '#/components/messages/MessageForm.tsx'
import { MessageThread } from '#/components/messages/MessageThread.tsx'
import { SearchInput } from '#/components/ui/SearchInput.tsx'
import { SEARCH_MAX_LENGTH, type Message } from '#/lib/message.ts'
import { getConversation, markRead, searchMessages } from '#/lib/messages.functions.ts'
import { useDebounced } from '#/lib/useDebounced.ts'

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
        {/* Keyed so a draft or reply never moves to another conversation. */}
        <Chat
          key={conversationId}
          conversationId={conversationId}
          title={title}
          messages={messages}
          guardianId={guardian.guardianId}
        />
      </div>
    </section>
  )
}

type ChatProps = {
  conversationId: string
  title: string
  messages: Message[]
  guardianId: string
}

function Chat({ conversationId, title, messages, guardianId }: ChatProps) {
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [query, setQuery] = useState('')
  const search = useDebounced(query.trim())
  const results = useQuery({
    // Includes the loaded messages, so results follow new messages and reactions.
    queryKey: ['message-search', conversationId, search, messages],
    queryFn: () => searchMessages({ data: { conversationId, query: search } }),
    enabled: search !== '',
    placeholderData: keepPreviousData,
    gcTime: 0,
  })
  const isSearching = search !== ''

  return (
    <>
      <SearchInput
        label="Search this chat"
        value={query}
        onChange={(value) => setQuery(value.slice(0, SEARCH_MAX_LENGTH))}
      />
      {results.isError && isSearching && (
        <p role="alert" className="text-magenta">
          {results.error.message}
        </p>
      )}
      <MessageThread
        messages={isSearching ? (results.data ?? []) : messages}
        emptyMessage={
          !isSearching
            ? 'No messages yet.'
            : results.isPending
              ? 'Searching…'
              : 'No messages match your search.'
        }
        guardianId={guardianId}
        onReply={setReplyTo}
      />
      <MessageForm
        conversationId={conversationId}
        title={title}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSent={() => {
          setReplyTo(null)
          // Back to the whole chat, where the new message is.
          setQuery('')
        }}
      />
    </>
  )
}
