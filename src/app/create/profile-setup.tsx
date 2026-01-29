'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Briefcase, Users, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { cn } from '@/lib/utils'

interface ProfileSetupProps {
  initialCompany: string
  initialTargetRole: string
}

export function ProfileSetup({ initialCompany, initialTargetRole }: ProfileSetupProps) {
  const router = useRouter()
  const [company, setCompany] = useState(initialCompany)
  const [targetRole, setTargetRole] = useState(initialTargetRole)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = company.trim().length >= 2 && targetRole.trim().length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          targetRole: targetRole.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      // Redirect to practice
      router.push('/practice')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Quick Setup
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Who do you sell to?
            </h1>
            <p className="text-muted-foreground text-sm">
              We'll customize your training based on your target buyers
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-8 space-y-6"
          >
            {/* Company Field */}
            <div className="space-y-2">
              <label
                htmlFor="company"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Company you work for
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., ZoomInfo, Salesforce, HubSpot"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-background text-foreground',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold',
                  'transition-all'
                )}
                autoFocus
              />
            </div>

            {/* Target Role Field */}
            <div className="space-y-2">
              <label
                htmlFor="targetRole"
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <Users className="w-4 h-4 text-muted-foreground" />
                Role you sell to
              </label>
              <input
                id="targetRole"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., VP of Sales, CTO, Head of Marketing"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-background text-foreground',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold',
                  'transition-all'
                )}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-error text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={cn(
                'w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all',
                isValid && !isLoading
                  ? 'bg-gold text-primary-foreground hover:bg-gold/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Practice
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>

          {/* Skip Option */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            <button
              onClick={() => router.push('/practice')}
              className="hover:text-foreground underline"
            >
              Skip for now
            </button>
          </motion.p>

          {/* Helper Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground/60 mt-4"
          >
            This helps us generate relevant objections and scenarios for your practice calls
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
