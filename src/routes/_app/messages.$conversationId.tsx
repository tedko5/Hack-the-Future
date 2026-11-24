import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { ConversationList, titleOf } from '#/components/messages/ConversationList.tsx'
import { MessageForm } from '#/components/messages/MessageForm.tsx'
import { MessageThread } from '#/components/messages/MessageThread.tsx'
import { SearchInput } from '#/components/ui/SearchInput.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import { MAX_MESSAGES, MESSAGE_PAGE_SIZE, SEARCH_MAX_LENGTH, type Message } from '#/lib/schemas/message.ts'
import { getConversation, markRead, searchMessages } from '#/lib/functions/messages.functions.ts'
import { useDebounced } from '#/lib/hooks/useDebounced.ts'

export const Route = createFileRoute('/_app/messages/$conversationId')({
  // How many messages are shown. Left out, it is one page.
  validateSearch: z.object({
    show: z.int().min(1).max(MAX_MESSAGES).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ limit: search.show }),
  loader: ({ params, deps }) => getConversation({ data: { ...params, ...deps } }),
  component: MessagesPage,
  notFoundComponent: ConversationNotFound,
})

function ConversationNotFound() {
  const t = useT()
  return <p className="rounded-[18px] bg-panel p-6">{t.messages.notFound}</p>
}

function MessagesPage() {
  const t = useT()
  const { conversations, current, messages, hasOlder } = Route.useLoaderData()
  const { guardian } = Route.useRouteContext()
  const router = useRouter()
  const { show = MESSAGE_PAGE_SIZE } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { conversationId, unread } = current
  const title = titleOf(current, t)
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
          onShowOlder={
            hasOlder && show < MAX_MESSAGES
              ? () =>
                  void navigate({
                    search: { show: Math.min(show + MESSAGE_PAGE_SIZE, MAX_MESSAGES) },
                    replace: true,
                    resetScroll: false,
                  })
              : undefined
          }
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
  /** Only when there are older messages. */
  onShowOlder?: () => void
}

function Chat({ conversationId, title, messages, guardianId, onShowOlder }: ChatProps) {
  const t = useT()
  const format = useFormat()
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
        label={t.messages.searchChat}
        value={query}
        onChange={(value) => setQuery(value.slice(0, SEARCH_MAX_LENGTH))}
      />
      {results.isError && isSearching && (
        <p role="alert" className="text-magenta">
          {format.error(results.error)}
        </p>
      )}
      <MessageThread
        messages={isSearching ? (results.data ?? []) : messages}
        emptyMessage={
          !isSearching
            ? t.messages.none
            : results.isPending
              ? t.messages.searching
              : t.messages.noMatch
        }
        guardianId={guardianId}
        onReply={setReplyTo}
        onShowOlder={isSearching ? undefined : onShowOlder}
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
