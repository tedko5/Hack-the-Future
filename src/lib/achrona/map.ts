import type { Glitch } from '#/lib/schemas/glitch.ts'

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
  { id: 'crystal-spire', x: 510, y: 320, keywords: ['crystal', 'magic', 'reserve', 'mana', 'spire', 'well', 'core'] },
  { id: 'clock-tower', x: 790, y: 230, keywords: ['clock', 'tower', 'time', 'loop', 'hour', 'east'] },
  { id: 'archive-vaults', x: 290, y: 210, keywords: ['archive', 'vault', 'book', 'library', 'record', 'scroll', 'data'] },
  { id: 'ley-market', x: 420, y: 480, keywords: ['market', 'trade', 'shop', 'sensor', 'signal', 'echo', 'inventory'] },
  { id: 'rift-gate', x: 760, y: 470, keywords: ['rift', 'portal', 'gate', 'void', 'flicker', 'tear'] },
  { id: 'whispering-woods', x: 215, y: 400, keywords: ['wood', 'forest', 'tree', 'garden', 'west', 'whisper'] },
  { id: 'moonlit-harbor', x: 600, y: 135, keywords: ['harbor', 'harbour', 'sea', 'water', 'river', 'bridge', 'ship', 'north'] },
]

/**
 * The district a description mentions: the first one with a keyword at the start of a word,
 * so "vaults" finds vault but "drifting" not rift. Glitches that name no district gather at
 * the Crystal Spire, the heart of Achrona.
 */
export function districtFor(description: string): District {
  const words = description.toLowerCase().split(/[^a-z]+/)
  const named = DISTRICTS.find((district) =>
    district.keywords.some((keyword) => words.some((word) => word.startsWith(keyword))),
  )
  return named ?? DISTRICTS[0]
}

/**
 * Where the 1st, 2nd, 3rd… glitch of a district goes, relative to its centre: above, upper
 * left, upper right, left, right, then higher up. Never below: the district's name is there.
 */
const SPOTS = [
  [0, -76],
  [-70, -40],
  [70, -40],
  [-92, 12],
  [92, 12],
  [0, -146],
] as const

/** Keeps a marker on the map near the edges. */
const MARGIN = 30
const clamp = (value: number, max: number) => Math.min(Math.max(value, MARGIN), max - MARGIN)

export type GlitchLocation = { district: District; x: number; y: number }

/**
 * Every glitch's place on the map. Each district hands out its spots in order, oldest glitch
 * (lowest ID) first, so a glitch keeps its place when newer ones arrive. After the sixth,
 * the spots are reused.
 */
export function placeGlitches<T extends Pick<Glitch, 'glitchId' | 'description'>>(
  glitches: T[],
): Map<string, GlitchLocation> {
  const places = new Map<string, GlitchLocation>()
  const taken = new Map<DistrictId, number>()
  const oldestFirst = [...glitches].sort((a, b) => a.glitchId.localeCompare(b.glitchId))

  for (const glitch of oldestFirst) {
    const district = districtFor(glitch.description)
    const count = taken.get(district.id) ?? 0
    taken.set(district.id, count + 1)
    const [dx, dy] = SPOTS[count % SPOTS.length]
    places.set(glitch.glitchId, {
      district,
      x: clamp(district.x + dx, MAP_WIDTH),
      y: clamp(district.y + dy, MAP_HEIGHT),
    })
  }
  return places
}
