import type { Metadata } from 'next'
import { Lock } from 'lucide-react'
import { Header } from '@/components/ui/header'
import { UpdatePasswordForm } from './update-password-form'

export const metadata: Metadata = {
  title: 'Update Password | Underdog Sales',
  description: 'Set your new password',
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <main className="pt-24 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-navy" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">
              Reset Your Password
            </h1>
            <p className="text-muted-foreground">
              Create a new secure password for your account
            </p>
          </div>

          {/* Form */}
          <UpdatePasswordForm />
        </div>
      </main>
    </div>
  )
}
