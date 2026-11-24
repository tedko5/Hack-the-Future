export const LANGUAGES = ['en', 'nl'] as const

export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'en'

/** For dates. Dutch is the Belgian variety. */
export const LOCALES: Record<Language, string> = { en: 'en-GB', nl: 'nl-BE' }

export function isLanguage(value: string | undefined): value is Language {
  return LANGUAGES.some((language) => language === value)
}
