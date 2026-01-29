'use client'

import { useState, useTransition } from 'react'
import { User } from '@supabase/supabase-js'
import { motion } from 'motion/react'
import { User as UserIcon, Mail, Lock, Check, AlertCircle, Loader2, Building2, Briefcase } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateName, updateEmail, sendPasswordReset, updateWorkInfo } from './actions'

interface SettingsFormProps {
  user: User
  userName?: string
  userCompany?: string
  userJobTitle?: string
}

interface FormState {
  error?: string
  success?: string
}

function StatusMessage({ error, success }: FormState) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error text-sm"
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error}
      </motion.div>
    )
  }
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm"
      >
        <Check className="w-4 h-4 flex-shrink-0" />
        {success}
      </motion.div>
    )
  }
  return null
}

export function SettingsForm({ user, userName, userCompany, userJobTitle }: SettingsFormProps) {
  const [nameState, setNameState] = useState<FormState>({})
  const [workState, setWorkState] = useState<FormState>({})
  const [emailState, setEmailState] = useState<FormState>({})
  const [passwordState, setPasswordState] = useState<FormState>({})

  const [isNamePending, startNameTransition] = useTransition()
  const [isWorkPending, startWorkTransition] = useTransition()
  const [isEmailPending, startEmailTransition] = useTransition()
  const [isPasswordPending, startPasswordTransition] = useTransition()

  const handleNameSubmit = (formData: FormData) => {
    setNameState({})
    startNameTransition(async () => {
      const result = await updateName(formData)
      if (result.error) {
        setNameState({ error: result.error })
      } else if (result.success) {
        setNameState({ success: result.message })
      }
    })
  }

  const handleWorkSubmit = (formData: FormData) => {
    setWorkState({})
    startWorkTransition(async () => {
      const result = await updateWorkInfo(formData)
      if (result.error) {
        setWorkState({ error: result.error })
      } else if (result.success) {
        setWorkState({ success: result.message })
      }
    })
  }

  const handleEmailSubmit = (formData: FormData) => {
    setEmailState({})
    startEmailTransition(async () => {
      const result = await updateEmail(formData)
      if (result.error) {
        setEmailState({ error: result.error })
      } else if (result.success) {
        setEmailState({ success: result.message })
      }
    })
  }

  const handlePasswordReset = () => {
    setPasswordState({})
    startPasswordTransition(async () => {
      const result = await sendPasswordReset()
      if (result.error) {
        setPasswordState({ error: result.error })
      } else if (result.success) {
        setPasswordState({ success: result.message })
      }
    })
  }

  const displayName = userName || user.user_metadata?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-gold" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your display name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleNameSubmit} className="space-y-4">
            <Input
              name="name"
              label="Display Name"
              defaultValue={displayName}
              placeholder="Your name"
              leftIcon={<UserIcon className="w-4 h-4" />}
              disabled={isNamePending}
            />
            <StatusMessage {...nameState} />
            <Button
              type="submit"
              variant="primary"
              disabled={isNamePending}
            >
              {isNamePending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Name'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Work Info Card */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold" />
            Work Information
          </CardTitle>
          <CardDescription>
            Your company and role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleWorkSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="company"
                label="Company"
                defaultValue={userCompany || ''}
                placeholder="Your company"
                leftIcon={<Building2 className="w-4 h-4" />}
                disabled={isWorkPending}
              />
              <Input
                name="jobTitle"
                label="Job Title"
                defaultValue={userJobTitle || ''}
                placeholder="Your role"
                leftIcon={<Briefcase className="w-4 h-4" />}
                disabled={isWorkPending}
              />
            </div>
            <StatusMessage {...workState} />
            <Button
              type="submit"
              variant="primary"
              disabled={isWorkPending}
            >
              {isWorkPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Work Info'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Card */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold" />
            Email Address
          </CardTitle>
          <CardDescription>
            Change your email address. You&apos;ll need to verify the new address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleEmailSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email Address"
              defaultValue={user.email}
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={isEmailPending}
            />
            <StatusMessage {...emailState} />
            <Button
              type="submit"
              variant="primary"
              disabled={isEmailPending}
            >
              {isEmailPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Update Email'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold" />
            Password
          </CardTitle>
          <CardDescription>
            We&apos;ll send a password reset link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current email: <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <StatusMessage {...passwordState} />
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Send Password Reset Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <span className="font-medium">Account ID:</span>{' '}
              <code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>
            </p>
            <p>
              <span className="font-medium">Member since:</span>{' '}
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
