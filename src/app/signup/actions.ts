'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface AuthResult {
  error?: string
  success?: boolean
  message?: string
}

export const signup = async (formData: FormData): Promise<AuthResult> => {
  const supabase = await createServerSupabaseClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validation
  if (!name || !email || !password) {
    return { error: 'All fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
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
    })

    if (insertError && !insertError.message?.includes('duplicate')) {
      // Log but don't fail - user is already created in auth
      console.error('Failed to create user record:', insertError)
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
