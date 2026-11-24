import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { UnreadBadge } from '#/components/messages/UnreadBadge.tsx'
import { SearchInput } from '#/components/ui/SearchInput.tsx'
import type { Conversation } from '#/lib/message.ts'
import { matchesSearch } from '#/lib/search.ts'

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  const [query, setQuery] = useState('')
  const found = conversations.filter(({ title }) => matchesSearch(query, title))

  return (
    <nav aria-label="Conversations" className="flex flex-col gap-3">
      <SearchInput label="Search people" value={query} onChange={setQuery} />
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto md:max-h-[min(55vh,460px)]">
        {found.length === 0 && <li className="px-3 text-muted">Nobody matches your search.</li>}
        {found.map(({ conversationId, title, unread }) => (
          <li key={conversationId}>
            <Link
              to="/messages/$conversationId"
              params={{ conversationId }}
              className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 hover:bg-row"
              activeProps={{ className: 'bg-row text-cyan' }}
            >
              <span className="min-w-0 truncate">{title}</span>
              <UnreadBadge count={unread} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
