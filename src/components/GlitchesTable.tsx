import { EllipsisVertical } from 'lucide-react'
import { IconButton } from '#/components/ui/IconButton.tsx'
import type { Glitch } from '#/lib/glitch.ts'

const columns = ['ID', 'Description', 'Timestamp', 'Action']

const timestampFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function GlitchesTable({ glitches }: { glitches: Glitch[] }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b-2 border-line text-muted">
              {columns.map((col, i) => (
                <th
                  key={col}
                  className={`px-5 py-4 font-normal ${i === columns.length - 1 ? 'text-center' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-fg">
            {glitches.map((glitch) => (
              <tr key={glitch.glitchId}>
                <td className="px-5 py-4 whitespace-nowrap">{glitch.glitchId}</td>
                <td className="px-5 py-4">{glitch.description}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {/* Server and browser time zones can differ; the browser's wins. */}
                  <time dateTime={glitch.timestamp} suppressHydrationWarning>
                    {timestampFormat.format(new Date(glitch.timestamp))}
                  </time>
                </td>
                <td className="px-5 py-4 text-center">
                  <IconButton aria-label={`${glitch.glitchId} actions`}>
                    <EllipsisVertical className="size-5" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
