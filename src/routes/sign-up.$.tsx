import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '#/components/layout/ThemeToggle.tsx'

export const Route = createFileRoute('/sign-up/$')({ component: SignUpPage })

function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <ThemeToggle className="absolute top-4 right-4 bg-panel" />
      <SignUp />
    </main>
  )
}
