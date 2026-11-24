import { createFileRoute } from '@tanstack/react-router'
import { useT } from '#/i18n/index.ts'

export const Route = createFileRoute('/_app/about')({ component: AboutPage })

/** The same address is in public/site-qr.svg. */
const SITE_URL = 'https://hack-the-future-production.up.railway.app'

const sectionClass = 'flex flex-col gap-4 rounded-[18px] bg-panel p-4 md:p-6'
const headingClass = 'font-display text-[1.6rem] font-bold'

function AboutPage() {
  const { title, intro, visit, qrCode, technologies, features } = useT().about

  return (
    <>
      <section className={sectionClass}>
        <h2 className={headingClass}>{title}</h2>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-prose leading-relaxed">{intro}</p>
          <figure className="flex shrink-0 flex-col items-center gap-2 text-center text-sm">
            {/* White around it in both themes, or phones cannot read it. */}
            <img src="/site-qr.svg" alt={qrCode} width={176} height={176} className="rounded-xl border-2 border-edge" />
            <figcaption>
              <span className="block text-muted">{visit}</span>
              <a href={SITE_URL} className="clickable">
                {new URL(SITE_URL).host}
              </a>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className={sectionClass}>
        <h2 className={headingClass}>{technologies.title}</h2>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {technologies.items.map(({ name, use }) => (
            <div key={name}>
              <dt className="font-bold">{name}</dt>
              <dd className="text-sm text-muted">{use}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className={sectionClass}>
        <h2 className={headingClass}>{features.title}</h2>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {features.groups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 font-display text-lg font-bold">{group.title}</h3>
              <ul className="list-disc space-y-1 pl-5 text-soft marker:text-violet">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
