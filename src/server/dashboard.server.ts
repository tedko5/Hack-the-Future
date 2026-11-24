import type { Dashboard } from '#/lib/schemas/dashboard.ts'
import type { Guardian } from '#/lib/schemas/guardian.ts'
import { magicLevel } from '#/lib/achrona/magic.ts'
import { listEchoes } from '#/server/echoes.server.ts'
import { listGlitches } from '#/server/glitches.server.ts'

/** Plain loader, so other server code (such as the chatbot) sees what the dashboard shows. */
export async function loadDashboard(guardian: Guardian): Promise<Dashboard> {
  const [glitches, echoes] = await Promise.all([listGlitches(), listEchoes()])
  return {
    guardian,
    magic: magicLevel(glitches.map((glitch) => glitch.status)),
    glitches,
    echoes,
  }
}
