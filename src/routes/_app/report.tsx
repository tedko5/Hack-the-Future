import { Link, createFileRoute } from '@tanstack/react-router'
import { FileDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { dictionaries, useFormat, useT } from '#/i18n/index.ts'
import { desyncStateFor } from '#/lib/desync.ts'
import { GLITCH_STATUSES, type Glitch } from '#/lib/glitch.ts'
import { sortGlitches } from '#/lib/glitchSort.ts'
import { getReport } from '#/lib/report.functions.ts'

const TOP_GUARDIANS = 5

export const Route = createFileRoute('/_app/report')({
  loader: () => getReport(),
  // Browsers use the title as the PDF's file name.
  head: ({ loaderData, match }) => {
    const { fileName } = dictionaries[match.context.language].report
    return { meta: [{ title: `${fileName} ${loaderData?.createdAt.slice(0, 10) ?? ''}`.trim() }] }
  },
  component: ReportPage,
})

function ReportPage() {
  const { guardian, magic, glitches, echoes, leaderboard, createdAt } = Route.useLoaderData()
  const t = useT()
  const format = useFormat()
  const open = sortGlitches(
    glitches.filter(({ status }) => status !== 'FIXED'),
    'urgent',
  )
  const fixed = glitches.filter(({ status }) => status === 'FIXED')
  const active = leaderboard.filter((entry) => entry.fixes + entry.echoes > 0)

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to="/" className="clickable text-sm text-muted">
          {t.glitches.back}
        </Link>
        <button
          type="button"
          className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-copper px-5.5 py-3 font-bold text-on-copper hover:brightness-110"
          onClick={() => window.print()}
        >
          <FileDown size={18} aria-hidden="true" />
          {t.report.save}
        </button>
      </div>

      {/* Paper, on screen as in print. */}
      <article className="flex flex-col gap-8 rounded-[18px] bg-white p-6 text-[#1b1b2b] md:p-10 print:rounded-none print:p-0">
        <header className="border-b-2 border-[#5b3fd0] pb-4">
          <h2 className="font-display text-3xl font-bold">{t.report.title}</h2>
          <p className="mt-2 text-sm text-[#55556b]">
            {t.report.drawnUpBy(format.dateTime(createdAt), guardian.codename, guardian.role)}
          </p>
        </header>

        <Section title={t.report.state}>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Figure
              label={t.report.magic(t.magic.states[desyncStateFor(magic)])}
              value={`${magic}%`}
            />
            <Figure label={t.report.openCount} value={open.length} />
            <Figure label={t.report.fixedCount} value={fixed.length} />
            <Figure label={t.report.echoCount} value={echoes.length} />
          </dl>
          <p className="text-sm">
            {GLITCH_STATUSES.map(
              (status) =>
                `${t.status[status]}: ${glitches.filter((glitch) => glitch.status === status).length}`,
            ).join(', ')}
          </p>
        </Section>

        <Section title={t.report.open}>
          <GlitchTable glitches={open} emptyMessage={t.report.noneOpen} />
        </Section>
        <Section title={t.report.fixed}>
          <GlitchTable glitches={fixed} emptyMessage={t.report.noneFixed} />
        </Section>
        <Section title={t.report.top}>
          {active.length === 0 ? (
            <p className="text-sm">{t.report.noActivity}</p>
          ) : (
            <ol className="text-sm">
              {active.slice(0, TOP_GUARDIANS).map(({ guardianId, rank, codename, role, fixes, echoes }) => (
                <li key={guardianId}>
                  {rank}. {codename} ({role}): {t.report.topEntry(fixes, echoes)}
                </li>
              ))}
            </ol>
          )}
        </Section>
      </article>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-display text-xl font-bold break-after-avoid">{title}</h3>
      {children}
    </section>
  )
}

function Figure({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col-reverse rounded-lg border border-[#c9c6e0] p-3">
      <dt className="text-sm text-[#55556b]">{label}</dt>
      <dd className="font-display text-2xl font-bold">{value}</dd>
    </div>
  )
}

function GlitchTable({ glitches, emptyMessage }: { glitches: Glitch[]; emptyMessage: string }) {
  const t = useT()
  const format = useFormat()
  if (glitches.length === 0) return <p className="text-sm">{emptyMessage}</p>
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-[#c9c6e0] text-[#55556b]">
            <th className="py-2 pr-3 font-normal">{t.report.columns.glitch}</th>
            <th className="py-2 pr-3 font-normal">{t.common.status}</th>
            <th className="py-2 pr-3 font-normal">{t.report.columns.description}</th>
            <th className="py-2 pr-3 font-normal">{t.report.columns.defender}</th>
            <th className="py-2 font-normal">{t.report.columns.reported}</th>
          </tr>
        </thead>
        <tbody>
          {glitches.map((glitch) => (
            <tr key={glitch.glitchId} className="break-inside-avoid border-b border-[#e4e2f0] align-top">
              <td className="py-2 pr-3 whitespace-nowrap">{glitch.glitchId}</td>
              <td className="py-2 pr-3">{t.status[glitch.status]}</td>
              <td className="min-w-40 py-2 pr-3 [overflow-wrap:anywhere]">{glitch.description}</td>
              <td className="py-2 pr-3">{glitch.assignedCodename ?? t.common.unassigned}</td>
              <td className="py-2 whitespace-nowrap">{format.dateTime(glitch.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
