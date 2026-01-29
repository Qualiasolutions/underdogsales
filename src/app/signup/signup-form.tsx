'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mic, Mail, Lock, User, ArrowRight, CheckCircle, Building2, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/motion'
import { signup } from './actions'

export const SignupForm = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/practice'

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result?.message) {
        setSuccess(result.message)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
            <Mic className="w-5 h-5 text-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground font-[family-name:var(--font-maven-pro)]">
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
              <h1 className="text-2xl font-bold text-foreground mb-2 font-[family-name:var(--font-maven-pro)]">
                Create Your Account
              </h1>
              <p className="text-muted-foreground text-sm">
                Start practicing cold calls with AI today
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-light border border-error/20 rounded-xl">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Success Message - Email Confirmation */}
            {success && (
              <div className="mb-6 p-6 bg-success-light border border-success/20 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Almost there!</h3>
                <p className="text-sm text-muted-foreground">{success}</p>
                <Link
                  href="/login"
                  className="inline-block mt-4 text-sm text-gold-dark hover:text-gold font-semibold transition-colors"
                >
                  Go to Sign In
                </Link>
              </div>
            )}

            {/* Form - hide when success */}
            {!success && <form action={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Company & Job Title Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      placeholder="Your company"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-2">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      required
                      placeholder="Your role"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    minLength={6}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    minLength={6}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
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
                Create Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>}

            {/* Login Link */}
            {!success && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link
                  href={`/login${redirectTo !== '/practice' ? `?redirect=${redirectTo}` : ''}`}
                  className="text-gold-dark hover:text-gold font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            )}
          </Card>
        </FadeIn>
      </main>
    </div>
  )
}
