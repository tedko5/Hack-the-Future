import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { ImagePlus, SendHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState, type ClipboardEvent, type ReactNode } from 'react'
import { IMAGE_TYPES, MESSAGE_MAX_LENGTH, quoteText, type Message } from '#/lib/message.ts'
import { sendMessage } from '#/lib/messages.functions.ts'
import { prepareImage } from '#/lib/prepareImage.ts'

type Props = {
  conversationId: string
  title: string
  replyTo: Message | null
  onReplyDone: () => void
}

export function MessageForm({ conversationId, title, replyTo, onReplyDone }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const textInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const pickImage = useMutation({ mutationFn: prepareImage, onSuccess: setImage })
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
      setImage(null)
      onReplyDone()
      return router.invalidate()
    },
  })
  const error = send.error ?? pickImage.error
  const isBusy = send.isPending || pickImage.isPending
  const canSend = (body.trim() !== '' || image !== null) && !isBusy

  function pasteImage(event: ClipboardEvent) {
    const { files } = event.clipboardData
    const file = [...files].find(({ type }) => type.startsWith('image/'))
    // Office apps add a picture of the text they copy; then the text is what is meant.
    if (!file || event.clipboardData.getData('text/plain')) return
    event.preventDefault()
    if (!isBusy) pickImage.mutate(file)
  }

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
        <Attachment label="Cancel reply" onRemove={onReplyDone}>
          <p className="min-w-0 truncate">
            Replying to <b>{replyTo.senderCodename}</b>: {quoteText(replyTo)}
          </p>
        </Attachment>
      )}
      {image && (
        <Attachment label="Remove image" onRemove={() => setImage(null)}>
          <ImagePreview image={image} />
        </Attachment>
      )}
      {error && (
        <p role="alert" className="text-magenta">
          {error.message}
        </p>
      )}
      <div className="flex gap-2">
        <input
          ref={fileInput}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            // Cleared, so the same file can be picked again after removing it.
            event.target.value = ''
            if (file) pickImage.mutate(file)
          }}
        />
        <button
          type="button"
          aria-label="Add an image"
          title="Add an image"
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-edge bg-well text-muted hover:text-cyan disabled:opacity-50"
          disabled={isBusy}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus size={20} />
        </button>
        <input
          ref={textInput}
          aria-label={`Message to ${title}`}
          placeholder={`Message ${title}`}
          className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-edge bg-well px-3.5 text-fg placeholder:text-muted"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onPaste={pasteImage}
          maxLength={MESSAGE_MAX_LENGTH}
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-copper text-[#1a0f08] hover:brightness-110 disabled:cursor-default disabled:opacity-50"
          disabled={!canSend}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
    </form>
  )
}

type AttachmentProps = {
  /** What the remove button does. */
  label: string
  onRemove: () => void
  children: ReactNode
}

function Attachment({ label, onRemove, children }: AttachmentProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-l-4 border-violet bg-row px-3 py-2 text-sm">
      {children}
      <button
        type="button"
        aria-label={label}
        title={label}
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-fg"
        onClick={onRemove}
      >
        <X size={18} />
      </button>
    </div>
  )
}

function ImagePreview({ image }: { image: File }) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const objectUrl = URL.createObjectURL(image)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [image])

  return <img src={url} alt="Your attachment" className="h-20 rounded-lg" />
}
