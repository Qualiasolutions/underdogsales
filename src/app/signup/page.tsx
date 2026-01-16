import { Suspense } from 'react'
import { SignupForm } from './signup-form'

export const metadata = {
  title: 'Create Account | Underdog AI Sales Coach',
  description: 'Create an account to start practicing cold calling with AI-powered simulations',
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
