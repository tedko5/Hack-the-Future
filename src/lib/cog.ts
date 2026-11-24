/** Size of one tooth step along the pitch circle; meshing gears must share it. */
export const COG_MODULE = 12

export type Cog = {
  cx: number
  cy: number
  teeth: number
  /** Rotation in degrees so its teeth line up with the gear it meshes with. */
  phase: number
  /** Turns the other way to the gear it meshes with. */
  reverse: boolean
}

export const pitchRadius = (teeth: number) => (COG_MODULE * teeth) / 2

const r2 = (n: number) => n.toFixed(2)
const circle = (cx: number, cy: number, r: number) =>
  `M${r2(cx + r)} ${r2(cy)} A${r2(r)} ${r2(r)} 0 1 0 ${r2(cx - r)} ${r2(cy)} A${r2(r)} ${r2(r)} 0 1 0 ${r2(cx + r)} ${r2(cy)}Z`

/**
 * A gear outline with a hub hole and six spoke windows, for `fill-rule="evenodd"`.
 * Teeth are centred on angles 0°, 360/teeth°, …; rotate by `phase` to align them.
 */
export function cogPath(cx: number, cy: number, teeth: number) {
  const p = pitchRadius(teeth)
  const tip = p + COG_MODULE * 0.6
  const root = p - COG_MODULE * 0.6
  const step = (2 * Math.PI) / teeth
  const at = (r: number, a: number) => `${r2(cx + r * Math.cos(a))} ${r2(cy + r * Math.sin(a))}`

  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    d += `${i === 0 ? 'M' : 'L'}${at(root, a - step * 0.3)} L${at(tip, a - step * 0.17)} L${at(tip, a + step * 0.17)} L${at(root, a + step * 0.3)} `
  }
  d += 'Z '
  d += circle(cx, cy, p * 0.2)
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + Math.PI / 6
    d += ' ' + circle(cx + p * 0.55 * Math.cos(a), cy + p * 0.55 * Math.sin(a), p * 0.17)
  }
  return d
}

/** Rotation that puts a gap of `teeth` at `angle` (degrees): what a gear needs where another's tooth points at it. */
function gapPhase(teeth: number, angle: number) {
  const pitch = 360 / teeth
  return (((angle + pitch / 2) % pitch) + pitch) % pitch
}

/**
 * Three meshing gears for a corner: a big one in the corner, a medium one beside it and a
 * small one below that. Each is spaced at the sum of the pitch radii and phased so
 * tooth meets gap.
 */
export function cornerCogs(): Cog[] {
  const a = { cx: 150, cy: 150, teeth: 24 }
  // a has a tooth at every multiple of 15°, including 30°: put b there.
  const ab = 30
  const bDist = pitchRadius(a.teeth) + pitchRadius(14)
  const b = { cx: a.cx + bDist * Math.cos((ab * Math.PI) / 180), cy: a.cy + bDist * Math.sin((ab * Math.PI) / 180), teeth: 14 }
  const bPhase = gapPhase(b.teeth, ab + 180)
  // c sits on one of b's teeth, so it needs a gap facing back at b.
  const bc = bPhase + 3 * (360 / b.teeth)
  const cDist = pitchRadius(b.teeth) + pitchRadius(10)
  const c = { cx: b.cx + cDist * Math.cos((bc * Math.PI) / 180), cy: b.cy + cDist * Math.sin((bc * Math.PI) / 180), teeth: 10 }

  // Rounded: server and browser Math.cos can differ in the last digits, which breaks hydration.
  const round = (cog: Cog): Cog => ({ ...cog, cx: +cog.cx.toFixed(2), cy: +cog.cy.toFixed(2), phase: +cog.phase.toFixed(2) })
  return [
    { ...a, phase: 0, reverse: false },
    { ...b, phase: bPhase, reverse: true },
    { ...c, phase: gapPhase(c.teeth, bc + 180), reverse: false },
  ].map(round)
}
