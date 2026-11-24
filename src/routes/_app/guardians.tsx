import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { ListControls } from '#/components/ui/ListControls.tsx'
import type { GuardianRole } from '#/lib/guardian.ts'
import { listGuardians, setGuardianRole } from '#/lib/guardians.functions.ts'
import { matchesSearch } from '#/lib/search.ts'

export const Route = createFileRoute('/_app/guardians')({
  beforeLoad: ({ context }) => {
    if (context.guardian.role !== 'commander') throw redirect({ to: '/' })
  },
  loader: () => listGuardians(),
  component: GuardiansPage,
})

const GUARDIAN_SORTS = { codename: 'By codename', role: 'By role' }

function GuardiansPage() {
  const guardians = Route.useLoaderData()
  const { guardian: me } = Route.useRouteContext()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<keyof typeof GUARDIAN_SORTS>('codename')
  // Listed by codename already, and sorting keeps that order within a role.
  const sorted =
    sort === 'codename' ? guardians : guardians.toSorted((a, b) => a.role.localeCompare(b.role))
  const found = sorted.filter(({ codename, role }) => matchesSearch(query, codename, role))
  const changeRole = useMutation({
    mutationFn: (data: { guardianId: string; role: GuardianRole }) => setGuardianRole({ data }),
    onSettled: () => router.invalidate(),
  })

  return (
    <div className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5">
      <h2 className="font-display text-[1.6rem] font-bold">Guardians</h2>
      <ListControls
        searchLabel="Search guardians"
        query={query}
        onQueryChange={setQuery}
        sorts={GUARDIAN_SORTS}
        sort={sort}
        onSortChange={setSort}
      />
      {changeRole.isError && <p className="text-magenta">{changeRole.error.message}</p>}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-line text-muted">
            <th className="px-5 py-4 font-normal">Codename</th>
            <th className="px-5 py-4 font-normal">Role</th>
            <th className="px-5 py-4 font-normal">Action</th>
          </tr>
        </thead>
        <tbody className="text-fg">
          {found.map((guardian) => {
            const nextRole = guardian.role === 'commander' ? 'defender' : 'commander'
            return (
              <tr key={guardian.guardianId}>
                <td className="px-5 py-4">
                  <GuardianLink {...guardian} />
                </td>
                <td className="px-5 py-4">{guardian.role}</td>
                <td className="px-5 py-4">
                  {guardian.guardianId !== me.guardianId && (
                    <button
                      type="button"
                      className="clickable cursor-pointer text-cyan disabled:opacity-50"
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
      {found.length === 0 && <p className="px-5 text-muted">No guardians match your search.</p>}
    </div>
  )
}
