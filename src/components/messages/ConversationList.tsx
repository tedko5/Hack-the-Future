import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '#/components/guardians/Avatar.tsx'
import { UnreadBadge } from '#/components/messages/UnreadBadge.tsx'
import { SearchInput } from '#/components/ui/SearchInput.tsx'
import { EVERYONE, type Conversation } from '#/lib/message.ts'
import { matchesSearch } from '#/lib/search.ts'

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  const [query, setQuery] = useState('')
  const found = conversations.filter(({ title }) => matchesSearch(query, title))

  return (
    <nav aria-label="Conversations" className="flex flex-col gap-3">
      <SearchInput label="Search people" value={query} onChange={setQuery} />
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto md:max-h-[min(55vh,460px)]">
        {found.length === 0 && <li className="px-3 text-muted">Nobody matches your search.</li>}
        {found.map(({ conversationId, title, imageUrl, unread }) => (
          <li key={conversationId}>
            <Link
              to="/messages/$conversationId"
              params={{ conversationId }}
              className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 hover:bg-row"
              activeProps={{ className: 'bg-row text-cyan' }}
            >
              {conversationId === EVERYONE ? (
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bubble text-fg"
                >
                  <Users size={16} />
                </span>
              ) : (
                <Avatar codename={title} imageUrl={imageUrl} />
              )}
              <span className="min-w-0 flex-1 truncate">{title}</span>
              <UnreadBadge count={unread} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
