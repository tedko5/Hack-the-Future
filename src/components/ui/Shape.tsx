export type ShapeKind = 'circle' | 'diamond' | 'square' | 'triangle'

/**
 * 12×12 status mark. Each status gets its own shape as well as its own colour,
 * so it never relies on colour alone. Render inside an <svg viewBox="0 0 12 12">.
 */
export function ShapePath({ kind, color }: { kind: ShapeKind; color: string }) {
  switch (kind) {
    case 'circle':
      return <circle cx="6" cy="6" r="5.5" fill={color} />
    case 'diamond':
      return <polygon points="6,0 12,6 6,12 0,6" fill={color} />
    case 'square':
      return <rect x=".5" y=".5" width="11" height="11" rx="3" fill={color} />
    case 'triangle':
      return <polygon points="6,0.5 11.5,11 0.5,11" fill={color} />
  }
}

export function Shape({ kind, color, size = 12 }: { kind: ShapeKind; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <ShapePath kind={kind} color={color} />
    </svg>
  )
}
