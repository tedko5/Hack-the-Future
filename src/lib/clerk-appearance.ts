import type { ClerkProvider } from '@clerk/tanstack-react-start'
import type { ComponentProps } from 'react'

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>['appearance']>

/**
 * Clerk's sign-in, sign-up and account UI in the mission control style.
 * Clerk's CSS lives in the `clerk` layer (declared in styles.css, below Tailwind's
 * utilities), so the Tailwind classes in `elements` win without `!important`.
 */
export const clerkAppearance: Appearance = {
  cssLayerName: 'clerk',
  variables: {
    colorPrimary: '#d9803f',
    colorPrimaryForeground: '#1a0f08',
    colorBackground: '#2b2e45',
    colorForeground: '#dfe6ff',
    colorMuted: '#1d2040',
    colorMutedForeground: '#9aa3d6',
    colorNeutral: '#dfe6ff',
    colorInput: '#141527',
    colorInputForeground: '#dfe6ff',
    colorBorder: '#5b3fd0',
    colorRing: '#a48cf0',
    colorDanger: '#ff6af3',
    colorSuccess: '#4df3ff',
    colorWarning: '#e8954f',
    colorShadow: '#000000',
    fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
    fontFamilyButtons: 'Figtree, ui-sans-serif, system-ui, sans-serif',
    borderRadius: '0.75rem',
  },
  options: {
    // The well's three crystals in miniature, above the heading.
    logoImageUrl: '/achrona-emblem.svg',
    logoPlacement: 'inside',
  },
  elements: {
    // `clerk-card` (styles.css): faint rift branches, panel colour and a gradient border.
    // The card and footer go transparent so the branches show through them.
    cardBox: 'clerk-card rounded-[18px] border-2 border-transparent shadow-[0_12px_40px_rgb(0_0_0/0.55)]',
    card: 'bg-transparent',
    footer: 'bg-none bg-transparent',
    logoBox: 'h-16 justify-center',
    logoImage: 'h-16 w-auto',
    // Engraved like the page title, scaled down.
    headerTitle:
      'font-display text-[1.9rem] leading-tight font-bold [text-shadow:1px_1px_0_#5b3fd0,2px_2px_0_#5b3fd0,3px_3px_0_#2f1f80]',
    headerSubtitle: 'text-muted',
    formFieldInput: 'border-2 border-edge bg-well',
    // Violet crystal slab (`clerk-continue` in styles.css) that sinks into its edge when pressed.
    formButtonPrimary: 'clerk-continue min-h-12 after:hidden',
    buttonArrowIcon: 'hidden',
    socialButtonsBlockButton: 'min-h-11 border-2 border-edge bg-row hover:bg-[#262a52]',
    footerActionLink: 'font-semibold text-[#b892ff] hover:text-fg',
    dividerLine: 'bg-[#3d4166]',
  },
}
