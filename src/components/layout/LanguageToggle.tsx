import { useRouter } from '@tanstack/react-router'
import { useLanguage, useT } from '#/i18n/index.ts'
import { saveLanguage } from '#/i18n/currentLanguage.ts'

/** Switches between English and Dutch. Shows the language you would switch to. */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const router = useRouter()
  const t = useT()
  const next = useLanguage() === 'en' ? 'nl' : 'en'

  return (
    <button
      type="button"
      // The name of the other language, in that language.
      lang={next}
      aria-label={t.languageSwitch}
      title={t.languageSwitch}
      className={`flex size-11 cursor-pointer items-center justify-center rounded-lg text-sm font-bold text-muted hover:text-fg ${className}`}
      onClick={() => {
        saveLanguage(next)
        void router.invalidate()
      }}
    >
      {next.toUpperCase()}
    </button>
  )
}
