import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie, getRequestHeader } from '@tanstack/react-start/server'
import { DEFAULT_LANGUAGE, isLanguage, type Language } from './language.ts'

const COOKIE = 'achrona-language'
const ONE_YEAR_S = 365 * 24 * 60 * 60

/** The chosen language, or else the browser's. The server puts it in <html lang>, where the client reads it. */
export const getLanguage = createIsomorphicFn()
  .server((): Language => {
    const chosen = getCookie(COOKIE)
    return isLanguage(chosen) ? chosen : preferredLanguage(getRequestHeader('Accept-Language'))
  })
  .client((): Language => {
    const { lang } = document.documentElement
    return isLanguage(lang) ? lang : DEFAULT_LANGUAGE
  })

/** The first language of the Accept-Language header that we speak. */
function preferredLanguage(header = ''): Language {
  const languages = header.split(',').map((part) => part.trim().slice(0, 2).toLowerCase())
  return languages.find(isLanguage) ?? DEFAULT_LANGUAGE
}

/** In the browser. Invalidate the router afterwards, so the pages follow. */
export function saveLanguage(language: Language) {
  document.cookie = `${COOKIE}=${language}; path=/; max-age=${ONE_YEAR_S}; samesite=lax`
  document.documentElement.lang = language
}
