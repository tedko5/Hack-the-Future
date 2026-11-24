import { Pencil, Trash2 } from 'lucide-react'
import { useT } from '#/i18n/index.ts'

type Props = {
  onEdit?: () => void
  onRemove?: () => void
}

const buttonClass =
  'flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted hover:text-highlight'

/** Shows only what the guardian may do. */
export function EditRemoveButtons({ onEdit, onRemove }: Props) {
  const t = useT()
  return (
    <span className="flex">
      {onEdit && (
        <button
          type="button"
          className={buttonClass}
          aria-label={t.common.edit}
          title={t.common.edit}
          onClick={onEdit}
        >
          <Pencil size={16} />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className={buttonClass}
          aria-label={t.common.remove}
          title={t.common.remove}
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </button>
      )}
    </span>
  )
}
