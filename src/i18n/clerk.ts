import { enGB } from '@clerk/localizations/en-GB'
import { nlBE } from '@clerk/localizations/nl-BE'
import type { Language } from './language.ts'

/** Clerk's own screens. The Dutch extras are texts it leaves out or makes too long. */
export const clerkLocalizations: Record<Language, typeof enGB> = {
  en: enGB,
  nl: {
    ...nlBE,
    socialButtonsBlockButtonManyInView: '{{provider|titleize}}',
    formFieldInputPlaceholder__signUpPassword: 'Kies een wachtwoord',
  },
}
