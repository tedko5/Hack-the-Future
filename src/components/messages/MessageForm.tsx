import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { SendHorizontal } from 'lucide-react'
import { useState } from 'react'
import { MESSAGE_MAX_LENGTH } from '#/lib/message.ts'
import { sendMessage } from '#/lib/messages.functions.ts'

type Props = {
  conversationId: string
  title: string
}

export function MessageForm({ conversationId, title }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const send = useMutation({
    mutationFn: () => sendMessage({ data: { conversationId, body } }),
    onSuccess: () => {
      setBody('')
      return router.invalidate()
    },
  })

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (body.trim() && !send.isPending) send.mutate()
      }}
    >
      {send.isError && (
        <p role="alert" className="text-magenta">
          {send.error.message}
        </p>
      )}
      <div className="flex gap-2">
        <input
          aria-label={`Message to ${title}`}
          placeholder={`Message ${title}`}
          className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-edge bg-well px-3.5 text-fg placeholder:text-muted"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MESSAGE_MAX_LENGTH}
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-copper text-[#1a0f08] hover:brightness-110 disabled:cursor-default disabled:opacity-50"
          disabled={!body.trim() || send.isPending}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </form>
  )
}
