export type DesyncState = 'stable' | 'unstable' | 'critical'

type DesyncStyle = {
  /** Bright tone: text, crystal tops. */
  color: string
  /** Deep tone: crystal bottoms. */
  deep: string
  glow: string
  /** Unlit crystal body. */
  body: string
}

export const DESYNC_STYLES: Record<DesyncState, DesyncStyle> = {
  stable: { color: '#6ff6ff', deep: '#4a5cff', glow: '#4df3ff', body: '#26306a' },
  unstable: { color: '#c9a8ff', deep: '#7a3fe0', glow: '#8a5cff', body: '#2a2060' },
  critical: { color: '#ff7af5', deep: '#b01fc4', glow: '#ff3df0', body: '#2a1330' },
}

/** `magic` is the percentage of magic left in Achrona (100 = all is well). */
export function desyncStateFor(magic: number): DesyncState {
  if (magic >= 80) return 'stable'
  if (magic >= 50) return 'unstable'
  return 'critical'
}
