import { createFileRoute } from '@tanstack/react-router'
import { useT } from '#/i18n/index.ts'

export const Route = createFileRoute('/_app/about')({ component: AboutPage })

const sectionClass = 'flex flex-col gap-4 rounded-[18px] bg-panel p-4 md:p-6'
const headingClass = 'font-display text-[1.6rem] font-bold'

function AboutPage() {
  const { title, intro, technologies, features } = useT().about

  return (
    <>
      <section className={sectionClass}>
        <h2 className={headingClass}>{title}</h2>
        <p className="max-w-prose leading-relaxed">{intro}</p>
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
