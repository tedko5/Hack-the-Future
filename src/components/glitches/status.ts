import type { ShapeKind } from '#/components/ui/Shape.tsx'
import type { GlitchStatus } from '#/lib/glitch.ts'

/**
 * Each status has its own shape as well as its own colour, so it never relies on colour alone.
 * Colours are theme variables (styles.css): use them as CSS `color`, not as SVG attributes.
 */
export const STATUS_STYLES: Record<GlitchStatus, { shape: ShapeKind; color: string }> = {
  LEAKED: { shape: 'square', color: 'var(--status-leaked)' },
  ASSESSING: { shape: 'diamond', color: 'var(--status-assessing)' },
  CONTAINING: { shape: 'triangle', color: 'var(--status-containing)' },
  FIXED: { shape: 'circle', color: 'var(--status-fixed)' },
}
