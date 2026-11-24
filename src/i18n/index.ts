import { rootRouteId, useRouteContext } from '@tanstack/react-router'
import { formatDateTime, formatDay, formatTime } from '#/lib/formatDate.ts'
import { en, type Dictionary } from './en.ts'
import { translateError } from './errors.ts'
import type { Language } from './language.ts'
import { nl } from './nl.ts'

export const dictionaries: Record<Language, Dictionary> = { en, nl }

export function useLanguage(): Language {
  return useRouteContext({ from: rootRouteId, select: ({ language }) => language })
}

/** The texts in the current language, as in `t.echoes.title`. */
export function useT(): Dictionary {
  return dictionaries[useLanguage()]
}

/** Dates and error messages in the current language. */
export function useFormat() {
  const language = useLanguage()
  return {
    dateTime: (isoTimestamp: string) => formatDateTime(isoTimestamp, language),
    day: (isoTimestamp: string) => formatDay(isoTimestamp, language),
    time: (isoTimestamp: string) => formatTime(isoTimestamp, language),
    /** Errors from the server are translated already; this covers the browser's own. */
    error: (error: Error) => translateError(error.message, language),
  }
}
