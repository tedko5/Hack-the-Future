import { createServerFn } from '@tanstack/react-start'
import type { Echo } from '#/lib/echo.ts'
import type { Guardian } from '#/lib/guardian.ts'

export type Dashboard = {
  guardian: Guardian
  /** Percentage of magic left in Achrona, 0–100. */
  magic: number
  openGlitches: number
  echoesToday: number
  /** Newest first. */
  echoes: Echo[]
}

// TODO(backend): replace the sample data below with real queries once the
// guardians/echoes tables and auth exist. The UI only depends on `Dashboard`.
export const getDashboard = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Dashboard> => {
    const echoes = sampleEchoes()
    return {
      guardian: { guardianId: 'g-1', codename: 'Nightwarden', role: 'commander' },
      magic: 68,
      openGlitches: new Set(
        echoes.filter((e) => e.glitch.status !== 'FIXED').map((e) => e.glitch.glitchId),
      ).size,
      echoesToday: echoes.length,
      echoes,
    }
  },
)

function sampleEchoes(): Echo[] {
  const rows: [string, string, string, Echo['reporter']['role'], string, Echo['glitch']['status']][] = [
    ['14:52', 'The lanterns on the Glasbridge flicker in reverse order, last one first.', 'Nightwarden', 'commander', 'GL-0042', 'LEAKED'],
    ['14:47', 'Ravens at the north tower keep repeating the same three seconds of flight.', 'Moss', 'defender', 'GL-0041', 'LEAKED'],
    ['14:31', 'Mana well in the Ember Quarter is reading 40% lower than an hour ago.', 'Quillfire', 'defender', 'GL-0039', 'ASSESSING'],
    ['14:18', 'Spell scrolls in the archive show blank pages; text returns after a minute.', 'Saffron', 'defender', 'GL-0039', 'ASSESSING'],
    ['13:56', 'Clocktower chimed 13 times. Second time today.', 'Moss', 'defender', 'GL-0037', 'CONTAINING'],
    ['13:40', 'Portal to the Saltmarsh opens two streets east of where it should.', 'Ironbark', 'commander', 'GL-0036', 'CONTAINING'],
    ['13:12', 'Shadows in the market square no longer follow their owners.', 'Quillfire', 'defender', 'GL-0035', 'ASSESSING'],
    ['12:58', 'Fountain water freezes mid-air for a few seconds, then falls.', 'Saffron', 'defender', 'GL-0034', 'LEAKED'],
    ['12:20', 'Ward runes on the east gate are glowing again.', 'Ironbark', 'commander', 'GL-0031', 'FIXED'],
    ['11:47', 'Bakery oven produces yesterday’s bread.', 'Moss', 'defender', 'GL-0030', 'FIXED'],
    ['10:03', 'Messenger birds arriving before they were sent.', 'Nightwarden', 'commander', 'GL-0028', 'LEAKED'],
    ['09:15', 'Moonstone readings stable after reset of the river ward.', 'Saffron', 'defender', 'GL-0025', 'FIXED'],
  ]
  return rows.map(([time, description, codename, role, glitchId, status], i) => ({
    echoId: `e-${rows.length - i}`,
    description,
    timestamp: new Date(`2026-11-24T${time}:00+01:00`).toISOString(),
    reporter: { codename, role },
    glitch: { glitchId, status },
  }))
}
