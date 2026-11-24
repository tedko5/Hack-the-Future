import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { LanguageToggle } from '#/components/layout/LanguageToggle.tsx'
import { useFormat, useT } from '#/i18n/index.ts'
import { CODENAME_MAX_LENGTH, CODENAME_MIN_LENGTH } from '#/lib/guardian.ts'
import { registerGuardian, requireNewcomer } from '#/lib/guardians.functions.ts'

export const Route = createFileRoute('/welcome')({
  beforeLoad: () => requireNewcomer(),
  component: WelcomePage,
})

function WelcomePage() {
  const t = useT()
  const format = useFormat()
  const router = useRouter()
  const [codename, setCodename] = useState('')
  const register = useMutation({
    mutationFn: () => registerGuardian({ data: { codename } }),
    onSuccess: () => router.navigate({ to: '/' }),
  })

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <LanguageToggle className="absolute top-4 right-4 bg-panel" />
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-[18px] bg-panel p-8"
        onSubmit={(event) => {
          event.preventDefault()
          register.mutate()
        }}
      >
        <h1 className="font-display text-2xl font-bold">{t.welcome.title}</h1>
        <label className="flex flex-col gap-2 text-muted">
          {t.common.codename}
          <input
            className="rounded-lg border-2 border-edge bg-well px-3 py-2 text-fg"
            value={codename}
            onChange={(event) => setCodename(event.target.value)}
            required
            minLength={CODENAME_MIN_LENGTH}
            maxLength={CODENAME_MAX_LENGTH}
            autoFocus
          />
        </label>
        {register.isError && <p className="text-magenta">{format.error(register.error)}</p>}
        <button
          type="submit"
          className="min-h-12 cursor-pointer rounded-xl bg-copper px-4 py-2 font-bold text-on-copper disabled:opacity-50"
          disabled={register.isPending}
        >
          {t.welcome.continue}
        </button>
      </form>
    </main>
  )
}
