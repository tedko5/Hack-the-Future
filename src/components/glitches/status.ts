import type { ShapeKind } from '#/components/ui/Shape.tsx'
import type { GlitchStatus } from '#/lib/glitch.ts'

/** Each status has its own shape as well as its own colour, so it never relies on colour alone. */
export const STATUS_STYLES: Record<GlitchStatus, { label: string; shape: ShapeKind; color: string }> = {
  LEAKED: { label: 'Leaked', shape: 'square', color: '#ff6af3' },
  ASSESSING: { label: 'Assessing', shape: 'diamond', color: '#b892ff' },
  CONTAINING: { label: 'Containing', shape: 'triangle', color: '#e8954f' },
  FIXED: { label: 'Fixed', shape: 'circle', color: '#4df3ff' },
}
