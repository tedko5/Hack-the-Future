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
  // Theme variables from styles.css, so Clerk switches with the dark/light theme.
  variables: {
    colorPrimary: 'var(--copper)',
    colorPrimaryForeground: 'var(--on-copper)',
    colorBackground: 'var(--panel)',
    colorForeground: 'var(--fg)',
    colorMuted: 'var(--row)',
    colorMutedForeground: 'var(--muted)',
    colorNeutral: 'var(--fg)',
    colorInput: 'var(--well)',
    colorInputForeground: 'var(--fg)',
    colorBorder: 'var(--edge)',
    colorRing: 'var(--field-focus)',
    colorDanger: 'var(--status-leaked)',
    colorSuccess: 'var(--status-fixed)',
    colorWarning: 'var(--status-containing)',
    colorShadow: '#000000',
    fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif',
    fontFamilyButtons: 'Figtree, ui-sans-serif, system-ui, sans-serif',
    borderRadius: '0.75rem',
  },
  options: {
    // The well's three crystals in miniature, above the heading. The light theme swaps it for
    // a clockwork cog in styles.css (`.cl-logoImage`).
    logoImageUrl: '/achrona-emblem.svg',
    logoPlacement: 'inside',
  },
  elements: {
    // `clerk-card` (styles.css): faint corner art (rift branches or cogs), panel colour and a
    // gradient border. The card and footer go transparent so the corner art shows through.
    cardBox: 'clerk-card rounded-[18px] border-2 border-transparent shadow-[0_12px_40px_rgb(0_0_0/0.55)]',
    card: 'bg-transparent',
    footer: 'bg-none bg-transparent',
    logoBox: 'h-16 justify-center',
    logoImage: 'h-16 w-auto',
    // Engraved like the page title, scaled down (`title-engraved-sm` in styles.css).
    headerTitle:
      'title-engraved-sm font-display text-[1.9rem] leading-tight font-bold',
    headerSubtitle: 'text-muted',
    formFieldInput: 'border-2 border-edge bg-well',
    // Slab button (`clerk-continue` in styles.css): violet crystal in dark, brass in light.
    formButtonPrimary: 'clerk-continue min-h-12 after:hidden',
    buttonArrowIcon: 'hidden',
    socialButtonsBlockButton: 'min-h-11 border-2 border-edge bg-row hover:bg-well',
    footerActionLink: 'font-semibold text-violet hover:text-fg',
    dividerLine: 'bg-line',
  },
}
