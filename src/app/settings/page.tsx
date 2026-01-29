import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Settings } from 'lucide-react'
import { getUser } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { SettingsForm } from './settings-form'

export const metadata: Metadata = {
  title: 'Settings | Underdog Sales',
  description: 'Manage your account settings and profile',
}

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login?redirect=/settings')
  }

  // Get user profile from public.users table
  const supabase = await createServerSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData } = await (supabase.from('users') as any)
    .select('name, company, job_title')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Settings className="w-5 h-5 text-foreground" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Account Settings
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your profile and account preferences
            </p>
          </div>

          {/* Settings Form */}
          <SettingsForm
            user={user}
            userName={userData?.name}
            userCompany={userData?.company}
            userJobTitle={userData?.job_title}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
