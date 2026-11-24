import { LOCALES, type Language } from '#/i18n/language.ts'

/** Pinned to Achrona's (Antwerp's) time zone, so server and browser render the same text. */
const TIME_ZONE = 'Europe/Brussels'

function createFormatter(options: Intl.DateTimeFormatOptions) {
  const create = (language: Language) =>
    new Intl.DateTimeFormat(LOCALES[language], { ...options, timeZone: TIME_ZONE })
  const formats: Record<Language, Intl.DateTimeFormat> = { en: create('en'), nl: create('nl') }
  return (isoTimestamp: string, language: Language) =>
    formats[language].format(new Date(isoTimestamp))
}

export const formatDateTime = createFormatter({
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatTime = createFormatter({ hour: '2-digit', minute: '2-digit' })

export const formatDay = createFormatter({ weekday: 'long', day: 'numeric', month: 'long' })

const dateFormat = new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeZone: TIME_ZONE })

/** Whether the moment is today in Achrona. */
export function isToday(isoTimestamp: string) {
  return dateFormat.format(new Date(isoTimestamp)) === dateFormat.format(new Date())
}
