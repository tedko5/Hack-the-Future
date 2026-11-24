import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { registerGuardian, requireNewcomer } from '#/lib/guardians.functions.ts'

export const Route = createFileRoute('/welcome')({
  beforeLoad: () => requireNewcomer(),
  component: WelcomePage,
})

function WelcomePage() {
  const router = useRouter()
  const [codename, setCodename] = useState('')
  const register = useMutation({
    mutationFn: () => registerGuardian({ data: { codename } }),
    onSuccess: () => router.navigate({ to: '/' }),
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-sidebar p-6">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-card p-8"
        onSubmit={(event) => {
          event.preventDefault()
          register.mutate()
        }}
      >
        <h1 className="text-2xl font-semibold text-fg">Choose your codename</h1>
        <label className="flex flex-col gap-2 text-muted">
          Codename
          <input
            className="rounded-lg border border-line px-3 py-2 text-fg"
            value={codename}
            onChange={(event) => setCodename(event.target.value)}
            required
            minLength={3}
            maxLength={24}
            autoFocus
          />
        </label>
        {register.isError && <p className="text-red-700">{register.error.message}</p>}
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-white disabled:opacity-50"
          disabled={register.isPending}
        >
          Continue
        </button>
      </form>
    </main>
  )
}
