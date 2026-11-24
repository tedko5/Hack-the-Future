import type { Glitch } from './glitch.ts'

export type DistrictId =
  | 'crystal-spire'
  | 'clock-tower'
  | 'archive-vaults'
  | 'ley-market'
  | 'rift-gate'
  | 'whispering-woods'
  | 'moonlit-harbor'

export type District = {
  id: DistrictId
  name: string
  /** Centre on the 1000×640 map. */
  x: number
  y: number
  /** Words in a glitch's description that place it here. */
  keywords: string[]
}

export const MAP_WIDTH = 1000
export const MAP_HEIGHT = 640

/** The heart of Achrona comes first: every ley line runs to it. */
export const DISTRICTS: District[] = [
  { id: 'crystal-spire', name: 'Crystal Spire', x: 510, y: 320, keywords: ['crystal', 'magic', 'reserve', 'mana', 'spire', 'well', 'core'] },
  { id: 'clock-tower', name: 'Clock Tower', x: 790, y: 230, keywords: ['clock', 'tower', 'time', 'loop', 'hour', 'east'] },
  { id: 'archive-vaults', name: 'Archive Vaults', x: 290, y: 210, keywords: ['archive', 'vault', 'book', 'library', 'record', 'scroll', 'data'] },
  { id: 'ley-market', name: 'Ley Market', x: 420, y: 480, keywords: ['market', 'trade', 'shop', 'sensor', 'signal', 'echo', 'inventory'] },
  { id: 'rift-gate', name: 'Rift Gate', x: 760, y: 470, keywords: ['rift', 'portal', 'gate', 'void', 'flicker', 'tear'] },
  { id: 'whispering-woods', name: 'Whispering Woods', x: 215, y: 400, keywords: ['wood', 'forest', 'tree', 'garden', 'west', 'whisper'] },
  { id: 'moonlit-harbor', name: 'Moonlit Harbor', x: 600, y: 135, keywords: ['harbor', 'harbour', 'sea', 'water', 'river', 'bridge', 'ship', 'north'] },
]

/** Small, stable string hash, so a glitch always lands on the same spot. */
function hash(text: string) {
  let value = 2166136261
  for (let index = 0; index < text.length; index++) {
    value = Math.imul(value ^ text.charCodeAt(index), 16777619)
  }
  return value >>> 0
}

/** The district a glitch's description mentions, or a stable pick when it names none. */
export function districtFor(glitch: Pick<Glitch, 'glitchId' | 'description'>): District {
  // Matched at the start of a word, so "vaults" finds vault but "drifting" not rift.
  const words = glitch.description.toLowerCase().split(/[^a-z]+/)
  const named = DISTRICTS.find((district) =>
    district.keywords.some((keyword) => words.some((word) => word.startsWith(keyword))),
  )
  return named ?? DISTRICTS[hash(glitch.glitchId) % DISTRICTS.length]
}

export type GlitchLocation = { district: District; x: number; y: number }

/** Somewhere around the district's centre, never on top of its label. */
export function locate(glitch: Pick<Glitch, 'glitchId' | 'description'>): GlitchLocation {
  const district = districtFor(glitch)
  const seed = hash(glitch.glitchId)
  // Above the centre: the district name sits right below it.
  const angle = ((190 + (seed % 160)) * Math.PI) / 180
  const radius = 42 + ((seed >>> 9) % 40)
  return {
    district,
    x: district.x + Math.cos(angle) * radius,
    y: district.y + Math.sin(angle) * radius * 0.75,
  }
}
