import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import type { GuardianRole } from '#/lib/guardian.ts'
import { listGuardians, setGuardianRole } from '#/lib/guardians.functions.ts'

export const Route = createFileRoute('/_app/guardians')({
  beforeLoad: ({ context }) => {
    if (context.guardian.role !== 'commander') throw redirect({ to: '/' })
  },
  loader: () => listGuardians(),
  component: GuardiansPage,
})

function GuardiansPage() {
  const guardians = Route.useLoaderData()
  const { guardian: me } = Route.useRouteContext()
  const router = useRouter()
  const changeRole = useMutation({
    mutationFn: (data: { guardianId: string; role: GuardianRole }) => setGuardianRole({ data }),
    onSettled: () => router.invalidate(),
  })

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold text-fg">Guardians</h1>
      {changeRole.isError && <p className="text-red-700">{changeRole.error.message}</p>}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-line text-muted">
            <th className="px-5 py-4 font-normal">Codename</th>
            <th className="px-5 py-4 font-normal">Role</th>
            <th className="px-5 py-4 font-normal">Action</th>
          </tr>
        </thead>
        <tbody className="text-fg">
          {guardians.map((guardian) => {
            const nextRole = guardian.role === 'commander' ? 'defender' : 'commander'
            return (
              <tr key={guardian.guardianId}>
                <td className="px-5 py-4">{guardian.codename}</td>
                <td className="px-5 py-4">{guardian.role}</td>
                <td className="px-5 py-4">
                  {guardian.guardianId !== me.guardianId && (
                    <button
                      type="button"
                      className="text-accent disabled:opacity-50"
                      disabled={changeRole.isPending}
                      onClick={() => changeRole.mutate({ guardianId: guardian.guardianId, role: nextRole })}
                    >
                      Make {nextRole}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
