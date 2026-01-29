'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Lock, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updatePassword } from '../actions'
import { createClient } from '@/lib/supabase/client'

interface FormState {
  error?: string
  success?: string
}

export function UpdatePasswordForm() {
  const router = useRouter()
  const [state, setState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)

  // Listen for PASSWORD_RECOVERY event
  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true)
      }
    })

    // Check if we're already in a session (user clicked link)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsRecoverySession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = (formData: FormData) => {
    setState({})
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result.error) {
        setState({ error: result.error })
      } else if (result.success) {
        setState({ success: result.message })
        // Redirect to settings after success
        setTimeout(() => {
          router.push('/settings')
        }, 2000)
      }
    })
  }

  if (!isRecoverySession) {
    return (
      <Card variant="bordered">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your reset link...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-gold" />
          Set New Password
        </CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it&apos;s strong and unique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            placeholder="Enter your new password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            disabled={isPending || !!state.success}
            hint="At least 8 characters with uppercase, lowercase, and a number"
          />

          <Input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="Confirm your new password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            disabled={isPending || !!state.success}
          />

          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {state.error}
            </motion.div>
          )}

          {state.success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm"
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              {state.success}
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isPending || !!state.success}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Password...
              </>
            ) : state.success ? (
              <>
                <Check className="w-4 h-4" />
                Password Updated!
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
