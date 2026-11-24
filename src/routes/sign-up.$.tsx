import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { LanguageToggle } from '#/components/layout/LanguageToggle.tsx'
import { ThemeToggle } from '#/components/layout/ThemeToggle.tsx'

export const Route = createFileRoute('/sign-up/$')({ component: SignUpPage })

function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageToggle className="bg-panel" />
        <ThemeToggle className="bg-panel" />
      </div>
      <SignUp />
    </main>
  )
}
