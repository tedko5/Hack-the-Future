import { Link } from '@tanstack/react-router'
import { UnreadBadge } from '#/components/messages/UnreadBadge.tsx'
import type { Conversation } from '#/lib/message.ts'

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  return (
    <nav aria-label="Conversations" className="max-h-48 overflow-y-auto md:max-h-none">
      <ul className="flex flex-col gap-1">
        {conversations.map(({ conversationId, title, unread }) => (
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
