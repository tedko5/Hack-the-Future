import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useT } from '#/i18n/index.ts'
import { REACTIONS, type Reaction, type ReactionEmoji } from '#/lib/message.ts'
import { toggleReaction } from '#/lib/messages.functions.ts'

export function useToggleReaction(messageId: number) {
  const router = useRouter()
  return useMutation({
    mutationFn: (emoji: ReactionEmoji) => toggleReaction({ data: { messageId, emoji } }),
    onSettled: () => router.invalidate(),
  })
}

export function ReactionPicker({ onPick }: { onPick: (emoji: ReactionEmoji) => void }) {
  const t = useT()
  return (
    <div role="group" aria-label={t.messages.reactions} className="flex flex-wrap rounded-xl bg-panel p-1">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={t.messages.reactWith(emoji)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-row"
          onClick={() => onPick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

type Props = {
  reactions: Reaction[]
  onToggle: (emoji: ReactionEmoji) => void
}

export function MessageReactions({ reactions, onToggle }: Props) {
  const t = useT()
  if (reactions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {reactions.map(({ emoji, codenames, isMine }) => (
        <button
          key={emoji}
          type="button"
          aria-pressed={isMine}
          aria-label={t.messages.reactionFrom(emoji, codenames.join(', '))}
          title={codenames.join(', ')}
          className={`flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-sm tabular-nums ${isMine ? 'border-highlight bg-row' : 'border-line bg-panel'}`}
          onClick={() => onToggle(emoji)}
        >
          {emoji} {codenames.length}
        </button>
      ))}
    </div>
  )
}
