'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * Validate password strength
 * Returns error message if invalid, null if valid
 */
function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  return null
}

export interface AuthResult {
  error?: string
  success?: boolean
  message?: string
}

export const signup = async (formData: FormData): Promise<AuthResult> => {
  // Rate limit by IP address
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`signup:${ip}`, RATE_LIMITS.signup)

  if (!rateLimitResult.allowed) {
    return { error: RATE_LIMITS.signup.message }
  }

  const supabase = await createServerSupabaseClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const company = formData.get('company') as string
  const jobTitle = formData.get('jobTitle') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validation
  if (!name || !email || !password || !company || !jobTitle) {
    return { error: 'All fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  // Password strength validation
  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError }
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, company, job_title: jobTitle },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Check if email confirmation is required
  if (data.user && !data.user.email_confirmed_at && data.user.identities?.length === 0) {
    // User already exists but hasn't confirmed email
    return { error: 'An account with this email already exists. Please check your email for a confirmation link.' }
  }

  // Create user record in public.users table
  if (data.user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from('users') as any).insert({
      id: data.user.id,
      email,
      name,
      company,
      job_title: jobTitle,
    })

    if (insertError && !insertError.message?.includes('duplicate')) {
      // Log but don't fail - user is already created in auth
      logger.error('Failed to create user record', { error: insertError.message, userId: data.user.id })
    }
  }

  // Check if email confirmation is pending
  if (data.user && !data.session) {
    // Email confirmation required - don't redirect, show success message
    return {
      success: true,
      message: 'Check your email! We sent you a confirmation link to complete your signup.',
    }
  }

  // User is auto-confirmed and logged in
  revalidatePath('/', 'layout')
  redirect('/practice')
}
