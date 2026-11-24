import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { Shape } from '#/components/ui/Shape.tsx'
import { useT } from '#/i18n/index.ts'
import type { GlitchStatus } from '#/lib/schemas/glitch.ts'

export function GlitchStatusLabel({ status }: { status: GlitchStatus }) {
  const t = useT()
  const { shape, color } = STATUS_STYLES[status]
  return (
    <span className="inline-flex items-center gap-2 font-medium" style={{ color }}>
      <Shape kind={shape} color={color} />
      {t.status[status]}
    </span>
  )
}
