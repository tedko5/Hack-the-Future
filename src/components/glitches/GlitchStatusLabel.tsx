import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { Shape } from '#/components/ui/Shape.tsx'
import type { GlitchStatus } from '#/lib/glitch.ts'

export function GlitchStatusLabel({ status }: { status: GlitchStatus }) {
  const { label, shape, color } = STATUS_STYLES[status]
  return (
    <span className="inline-flex items-center gap-2 font-medium" style={{ color }}>
      <Shape kind={shape} color={color} />
      {label}
    </span>
  )
}
