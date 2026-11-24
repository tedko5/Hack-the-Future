import { Link, getRouteApi } from '@tanstack/react-router'
import type { Guardian } from '#/lib/guardian.ts'

const appRoute = getRouteApi('/_app')

/** A codename that opens the chat with that guardian. Your own is plain text. */
export function GuardianLink({ guardianId, codename }: Pick<Guardian, 'guardianId' | 'codename'>) {
  const { guardian: me } = appRoute.useRouteContext()
  if (guardianId === me.guardianId) return <span className="text-fg">{codename}</span>

  return (
    <Link
      to="/messages/$conversationId"
      params={{ conversationId: guardianId }}
      title={`Message ${codename}`}
      className="clickable text-fg"
    >
      {codename}
    </Link>
  )
}
