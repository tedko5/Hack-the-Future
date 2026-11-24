import { ImagePlus } from 'lucide-react'
import { useRef } from 'react'
import { IMAGE_TYPES } from '#/lib/image.ts'

type Props = {
  disabled: boolean
  onPick: (file: File) => void
}

export function ImageButton({ disabled, onPick }: Props) {
  const input = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Cleared, so the same file can be picked again after removing it.
          event.target.value = ''
          if (file) onPick(file)
        }}
      />
      <button
        type="button"
        aria-label="Add an image"
        title="Add an image"
        className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-edge bg-well text-muted hover:text-cyan disabled:opacity-50"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        <ImagePlus size={20} />
      </button>
    </>
  )
}
