'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export interface AuthResult {
  error?: string
}

export const login = async (formData: FormData): Promise<AuthResult> => {
  // Rate limit by IP address
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`login:${ip}`, RATE_LIMITS.login)

  if (!rateLimitResult.allowed) {
    return { error: RATE_LIMITS.login.message }
  }

  const supabase = await createServerSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/practice')
}

export const logout = async (): Promise<void> => {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
