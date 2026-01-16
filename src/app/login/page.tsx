import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata = {
  title: 'Sign In | Underdog AI Sales Coach',
  description: 'Sign in to practice cold calling with AI-powered simulations',
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
