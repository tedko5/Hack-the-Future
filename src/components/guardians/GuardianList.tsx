import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { CollapsibleSection } from '#/components/ui/CollapsibleSection.tsx'
import { ListControls } from '#/components/ui/ListControls.tsx'
import { ShowMore, useShowMore } from '#/components/ui/ShowMore.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import type { Guardian, GuardianRole } from '#/lib/schemas/guardian.ts'
import { setGuardianRole } from '#/lib/functions/guardians.functions.ts'
import { matchesSearch } from '#/lib/utils/search.ts'

type Props = {
  guardians: Guardian[]
  /** Nobody can change their own role. */
  myId: string
}

/** Where commanders change roles. */
export function GuardianList({ guardians, myId }: Props) {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<keyof typeof t.guardians.sorts>('codename')
  // Listed by codename already, and sorting keeps that order within a role.
  const sorted =
    sort === 'codename' ? guardians : guardians.toSorted((a, b) => a.role.localeCompare(b.role))
  const found = sorted.filter(({ codename, role }) => matchesSearch(query, codename, role))
  const { visible, showMore } = useShowMore(found)
  const changeRole = useMutation({
    mutationFn: (data: { guardianId: string; role: GuardianRole }) => setGuardianRole({ data }),
    onSettled: () => router.invalidate(),
  })

  return (
    <CollapsibleSection title={t.guardians.title} count={guardians.length} storageKey="guardians">
      <div className="flex flex-col gap-4">
        <ListControls
          searchLabel={t.guardians.search}
          query={query}
          onQueryChange={setQuery}
          sorts={t.guardians.sorts}
          sort={sort}
          onSortChange={setSort}
        />
        {changeRole.isError && <p className="text-magenta">{format.error(changeRole.error)}</p>}
        <table className="w-full text-left text-sm md:text-base">
          <thead>
            <tr className="border-b-2 border-line text-muted">
              <th className="px-1.5 py-4 md:px-5 font-normal">{t.common.codename}</th>
              <th className="px-1.5 py-4 md:px-5 font-normal">{t.guardians.role}</th>
              <th className="px-1.5 py-4 md:px-5 font-normal">{t.guardians.action}</th>
            </tr>
          </thead>
          <tbody className="text-fg">
            {visible.map((guardian) => {
              const nextRole = guardian.role === 'commander' ? 'defender' : 'commander'
              return (
                <tr key={guardian.guardianId}>
                  <td className="px-1.5 py-4 md:px-5">
                    <GuardianLink {...guardian} />
                  </td>
                  <td className="px-1.5 py-4 md:px-5">{guardian.role}</td>
                  <td className="px-1.5 py-4 md:px-5">
                    {guardian.guardianId !== myId && (
                      <button
                        type="button"
                        className="clickable cursor-pointer text-left text-highlight disabled:opacity-50"
                        disabled={changeRole.isPending}
                        onClick={() => changeRole.mutate({ guardianId: guardian.guardianId, role: nextRole })}
                      >
                        {t.guardians.make(nextRole)}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {found.length === 0 && <p className="px-1.5 text-muted md:px-5">{t.guardians.noMatch}</p>}
        <ShowMore {...showMore} />
      </div>
    </CollapsibleSection>
  )
}
