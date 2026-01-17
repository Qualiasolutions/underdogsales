'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mic, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/motion'
import { login } from './actions'

export const LoginForm = () => {
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')
  const [error, setError] = useState<string | null>(
    authError === 'auth_failed' ? 'Authentication failed. Please try again.' : null
  )
  const [isPending, startTransition] = useTransition()
  const redirectTo = searchParams.get('redirect') || '/practice'

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
            <Mic className="w-5 h-5 text-navy" />
          </div>
          <span className="font-bold text-xl text-navy font-[family-name:var(--font-maven-pro)]">
            Underdog AI
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <FadeIn className="w-full max-w-md">
          <Card variant="elevated" className="p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-navy mb-2 font-[family-name:var(--font-maven-pro)]">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to continue your sales training
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-light border border-error/20 rounded-xl">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Form */}
            <form action={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-white text-navy placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-navy mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-white text-navy placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                loading={isPending}
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            {/* Signup Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <Link
                href={`/signup${redirectTo !== '/practice' ? `?redirect=${redirectTo}` : ''}`}
                className="text-gold-dark hover:text-gold font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </Card>
        </FadeIn>
      </main>
    </div>
  )
}
