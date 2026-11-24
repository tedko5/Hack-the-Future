import { Link, createFileRoute } from '@tanstack/react-router'
import { FileDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { STATUS_STYLES } from '#/components/glitches/status.ts'
import { DESYNC_STYLES, desyncStateFor } from '#/lib/desync.ts'
import { formatDateTime } from '#/lib/formatDate.ts'
import { GLITCH_STATUSES, type Glitch } from '#/lib/glitch.ts'
import { sortGlitches } from '#/lib/glitchSort.ts'
import { getReport } from '#/lib/report.functions.ts'

const TOP_GUARDIANS = 5

export const Route = createFileRoute('/_app/report')({
  loader: () => getReport(),
  // Browsers use the title as the PDF's file name.
  head: ({ loaderData }) => ({
    meta: [{ title: `Achrona report ${loaderData?.createdAt.slice(0, 10) ?? ''}`.trim() }],
  }),
  component: ReportPage,
})

function ReportPage() {
  const { guardian, magic, glitches, echoes, leaderboard, createdAt } = Route.useLoaderData()
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
          Back to mission control
        </Link>
        <button
          type="button"
          className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-copper px-5.5 py-3 font-bold text-[#1a0f08] hover:brightness-110"
          onClick={() => window.print()}
        >
          <FileDown size={18} aria-hidden="true" />
          Save as PDF
        </button>
      </div>

      {/* Paper, on screen as in print. */}
      <article className="flex flex-col gap-8 rounded-[18px] bg-white p-6 text-[#1b1b2b] md:p-10 print:rounded-none print:p-0">
        <header className="border-b-2 border-[#5b3fd0] pb-4">
          <h2 className="font-display text-3xl font-bold">Report to the High Council of Achrona</h2>
          <p className="mt-2 text-sm text-[#55556b]">
            {formatDateTime(createdAt)}, drawn up by {guardian.codename}, {guardian.role}
          </p>
        </header>

        <Section title="State of the realm">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Figure
              label={`Magic: ${DESYNC_STYLES[desyncStateFor(magic)].label.toLowerCase()}`}
              value={`${magic}%`}
            />
            <Figure label="Open glitches" value={open.length} />
            <Figure label="Fixed glitches" value={fixed.length} />
            <Figure label="Echoes reported" value={echoes.length} />
          </dl>
          <p className="text-sm">
            {GLITCH_STATUSES.map(
              (status) =>
                `${STATUS_STYLES[status].label}: ${glitches.filter((glitch) => glitch.status === status).length}`,
            ).join(', ')}
          </p>
        </Section>

        <Section title="Open glitches, most urgent first">
          <GlitchTable glitches={open} emptyMessage="No open glitches." />
        </Section>
        <Section title="Fixed glitches">
          <GlitchTable glitches={fixed} emptyMessage="No fixed glitches yet." />
        </Section>
        <Section title="Most valued guardians">
          {active.length === 0 ? (
            <p className="text-sm">No activity yet.</p>
          ) : (
            <ol className="text-sm">
              {active.slice(0, TOP_GUARDIANS).map(({ guardianId, rank, codename, role, fixes, echoes }) => (
                <li key={guardianId}>
                  {rank}. {codename} ({role}): {fixes} fixed, {echoes} echoes
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
  if (glitches.length === 0) return <p className="text-sm">{emptyMessage}</p>
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-[#c9c6e0] text-[#55556b]">
            <th className="py-2 pr-3 font-normal">Glitch</th>
            <th className="py-2 pr-3 font-normal">Status</th>
            <th className="py-2 pr-3 font-normal">Description</th>
            <th className="py-2 pr-3 font-normal">Defender</th>
            <th className="py-2 font-normal">Reported</th>
          </tr>
        </thead>
        <tbody>
          {glitches.map((glitch) => (
            <tr key={glitch.glitchId} className="break-inside-avoid border-b border-[#e4e2f0] align-top">
              <td className="py-2 pr-3 whitespace-nowrap">{glitch.glitchId}</td>
              <td className="py-2 pr-3">{STATUS_STYLES[glitch.status].label}</td>
              <td className="min-w-40 py-2 pr-3 [overflow-wrap:anywhere]">{glitch.description}</td>
              <td className="py-2 pr-3">{glitch.assignedCodename ?? 'Unassigned'}</td>
              <td className="py-2 whitespace-nowrap">{formatDateTime(glitch.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
