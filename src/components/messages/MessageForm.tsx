import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Attachment, ImageAttachment } from '#/components/images/Attachment.tsx'
import { ImageButton } from '#/components/images/ImageButton.tsx'
import { useImageAttachment } from '#/components/images/useImageAttachment.ts'
import { useFormat, useT } from '#/i18n/index.ts'
import { MESSAGE_MAX_LENGTH, type Message } from '#/lib/message.ts'
import { sendMessage } from '#/lib/messages.functions.ts'

type Props = {
  conversationId: string
  title: string
  replyTo: Message | null
  onCancelReply: () => void
  onSent: () => void
}

export function MessageForm({ conversationId, title, replyTo, onCancelReply, onSent }: Props) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const [body, setBody] = useState('')
  const textInput = useRef<HTMLInputElement>(null)
  const attachment = useImageAttachment()
  const { image, pickImage, pasteImage, removeImage } = attachment

  const send = useMutation({
    mutationFn: () => {
      const data = new FormData()
      data.set('conversationId', conversationId)
      data.set('body', body)
      if (replyTo) data.set('replyToId', String(replyTo.messageId))
      if (image) data.set('image', image)
      return sendMessage({ data })
    },
    onSuccess: () => {
      setBody('')
      removeImage()
      onSent()
      return router.invalidate()
    },
  })
  const error = send.error ?? attachment.error
  const isBusy = send.isPending || attachment.isPreparing
  const canSend = (body.trim() !== '' || image !== null) && !isBusy

  useEffect(() => {
    if (replyTo) textInput.current?.focus()
  }, [replyTo])

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) send.mutate()
      }}
    >
      {replyTo && (
        <Attachment label={t.messages.cancelReply} onRemove={onCancelReply}>
          <p className="min-w-0 truncate">
            {t.messages.replyingTo} <b>{replyTo.senderCodename}</b>:{' '}
            {replyTo.body || t.messages.image}
          </p>
        </Attachment>
      )}
      {image && <ImageAttachment image={image} onRemove={removeImage} />}
      {error && (
        <p role="alert" className="text-magenta">
          {format.error(error)}
        </p>
      )}
      <div className="flex gap-2">
        <ImageButton disabled={isBusy} onPick={pickImage} />
        <input
          ref={textInput}
          aria-label={t.messages.inputLabel(title)}
          placeholder={t.messages.placeholder(title)}
          className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-edge bg-well px-3.5 text-fg placeholder:text-muted"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onPaste={pasteImage}
          maxLength={MESSAGE_MAX_LENGTH}
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label={t.messages.send}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-copper text-on-copper hover:brightness-110 disabled:cursor-default disabled:opacity-50"
          disabled={!canSend}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </form>
  )
}
