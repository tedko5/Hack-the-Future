import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useT } from '#/i18n/index.ts'

type AttachmentProps = {
  /** What the remove button does. */
  label: string
  onRemove: () => void
  children: ReactNode
}

/** Something that goes along with a form, and can be taken off again. */
export function Attachment({ label, onRemove, children }: AttachmentProps) {
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

type ImageAttachmentProps = {
  image: File
  onRemove: () => void
}

export function ImageAttachment({ image, onRemove }: ImageAttachmentProps) {
  const t = useT()
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const objectUrl = URL.createObjectURL(image)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [image])

  return (
    <Attachment label={t.images.remove} onRemove={onRemove}>
      <img src={url} alt={t.images.preview} className="h-20 rounded-lg" />
    </Attachment>
  )
}
