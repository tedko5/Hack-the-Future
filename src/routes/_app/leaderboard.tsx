import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '#/components/guardians/Avatar.tsx'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { BadgeList } from '#/components/leaderboard/BadgeList.tsx'
import { ShowMore, useShowMore } from '#/components/ui/ShowMore.tsx'
import { useT } from '#/i18n/index.ts'
import { BADGES } from '#/lib/schemas/leaderboard.ts'
import { getLeaderboard } from '#/lib/functions/leaderboard.functions.ts'

export const Route = createFileRoute('/_app/leaderboard')({
  loader: () => getLeaderboard(),
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const entries = Route.useLoaderData()
  const { guardian: me } = Route.useRouteContext()
  const t = useT()
  const { visible, showMore } = useShowMore(entries)

  return (
    <>
      <section
        aria-labelledby="leaderboard-title"
        className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5"
      >
        <h2 id="leaderboard-title" className="font-display text-[1.6rem] font-bold">
          {t.leaderboard.title}
        </h2>
        <ol className="tech-frame divide-y divide-line overflow-hidden rounded-xl border-2 border-edge bg-well">
          {visible.map((entry) => (
            // Rank, avatar, name and stats on one row; the badges line up under the name.
            <li
              key={entry.guardianId}
              className={`grid grid-cols-[1.75rem_auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3 py-3 sm:grid-cols-[2rem_auto_minmax(0,1fr)_auto] sm:gap-x-4 sm:px-4 ${entry.guardianId === me.guardianId ? 'bg-row' : ''}`}
            >
              <span className="font-display text-xl font-bold text-copper tabular-nums">{entry.rank}</span>
              <Avatar codename={entry.codename} imageUrl={entry.imageUrl} />
              <span className="min-w-0">
                <span className="block truncate">
                  <GuardianLink guardianId={entry.guardianId} codename={entry.codename} />
                  {entry.guardianId === me.guardianId && <span className="text-muted"> {t.leaderboard.you}</span>}
                </span>
                <span className="block text-[.85rem] text-muted">{entry.role}</span>
              </span>
              {/* Stacked on phones, side by side from sm up. */}
              <span className="flex flex-col items-end text-sm leading-tight text-muted tabular-nums sm:flex-row sm:gap-3">
                <span>
                  <b className="text-fg">{entry.fixes}</b> {t.leaderboard.fixed}
                </span>
                <span>
                  <b className="text-fg">{entry.echoes}</b> {t.common.echoes(entry.echoes)}
                </span>
              </span>
              <span className="col-span-2 col-start-3 empty:hidden">
                <BadgeList badges={BADGES.filter((badge) => badge.isEarned(entry))} compact />
              </span>
            </li>
          ))}
        </ol>
        <ShowMore {...showMore} />
      </section>
      <section
        aria-labelledby="badges-title"
        className="flex flex-col gap-4 rounded-[18px] bg-panel p-3 md:p-4.5"
      >
        <h2 id="badges-title" className="font-display text-[1.6rem] font-bold">
          {t.leaderboard.badgesTitle}
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {BADGES.map((badge) => (
            <li key={badge.id} className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <BadgeList badges={[badge]} />
              {t.leaderboard.badges[badge.id].description}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
