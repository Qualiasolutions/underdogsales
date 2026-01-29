import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { ProfileSetup } from './profile-setup'

export const metadata: Metadata = {
  title: 'Quick Setup | Underdog AI Sales Coach',
  description: 'Tell us who you sell to so we can customize your training',
}

export default async function CreatePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Get existing profile data
  const supabase = getAdminClient()
  const { data: profile } = await supabase
    .from('users')
    .select('company, target_role')
    .eq('id', user.id)
    .single()

  return (
    <ProfileSetup
      initialCompany={profile?.company || ''}
      initialTargetRole={profile?.target_role || ''}
    />
  )
}
