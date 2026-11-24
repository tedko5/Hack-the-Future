import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '#/components/guardians/Avatar.tsx'
import { GuardianLink } from '#/components/guardians/GuardianLink.tsx'
import { BadgeList } from '#/components/leaderboard/BadgeList.tsx'
import { useT } from '#/i18n/index.ts'
import { BADGES } from '#/lib/leaderboard.ts'
import { getLeaderboard } from '#/lib/leaderboard.functions.ts'

export const Route = createFileRoute('/_app/leaderboard')({
  loader: () => getLeaderboard(),
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const entries = Route.useLoaderData()
  const { guardian: me } = Route.useRouteContext()
  const t = useT()

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
          {entries.map((entry) => (
            <li
              key={entry.guardianId}
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${entry.guardianId === me.guardianId ? 'bg-row' : ''}`}
            >
              <span className="w-8 font-display text-xl font-bold text-copper tabular-nums">
                {entry.rank}
              </span>
              <Avatar codename={entry.codename} imageUrl={entry.imageUrl} />
              <span className="min-w-32 flex-1">
                <span className="block">
                  <GuardianLink guardianId={entry.guardianId} codename={entry.codename} />
                  {entry.guardianId === me.guardianId && <span className="text-muted"> {t.leaderboard.you}</span>}
                </span>
                <span className="text-[.85rem] text-muted">{entry.role}</span>
              </span>
              <span className="text-sm text-muted tabular-nums">
                <b className="text-fg">{entry.fixes}</b> {t.leaderboard.fixed}
                <span className="ml-3">
                  <b className="text-fg">{entry.echoes}</b> {t.leaderboard.echoes(entry.echoes)}
                </span>
              </span>
              <span className="w-full pl-12">
                <BadgeList badges={BADGES.filter((badge) => badge.isEarned(entry))} />
              </span>
            </li>
          ))}
        </ol>
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
