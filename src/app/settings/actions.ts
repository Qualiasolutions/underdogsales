'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export interface ActionResult {
  error?: string
  success?: boolean
  message?: string
}

/**
 * Update user's display name
 */
export async function updateName(formData: FormData): Promise<ActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`updateName:${ip}`, RATE_LIMITS.signup)

  if (!rateLimitResult.allowed) {
    return { error: 'Too many requests. Please try again later.' }
  }

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update your name' }
  }

  const name = formData.get('name') as string

  if (!name || name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }

  // Update auth user metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { name: name.trim() }
  })

  if (authError) {
    logger.error('Failed to update auth user metadata', { error: authError.message, userId: user.id })
    return { error: 'Failed to update name. Please try again.' }
  }

  // Update public.users table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase.from('users') as any)
    .update({ name: name.trim() })
    .eq('id', user.id)

  if (dbError) {
    logger.error('Failed to update users table', { error: dbError.message, userId: user.id })
    // Don't return error - auth was updated successfully
  }

  revalidatePath('/settings')
  return { success: true, message: 'Name updated successfully' }
}

/**
 * Update user's work information (company and job title)
 */
export async function updateWorkInfo(formData: FormData): Promise<ActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`updateWorkInfo:${ip}`, RATE_LIMITS.signup)

  if (!rateLimitResult.allowed) {
    return { error: 'Too many requests. Please try again later.' }
  }

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update your work info' }
  }

  const company = formData.get('company') as string
  const jobTitle = formData.get('jobTitle') as string

  if (!company || company.trim().length < 1) {
    return { error: 'Company is required' }
  }

  if (!jobTitle || jobTitle.trim().length < 1) {
    return { error: 'Job title is required' }
  }

  // Update auth user metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { company: company.trim(), job_title: jobTitle.trim() }
  })

  if (authError) {
    logger.error('Failed to update auth user metadata', { error: authError.message, userId: user.id })
    return { error: 'Failed to update work info. Please try again.' }
  }

  // Update public.users table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase.from('users') as any)
    .update({ company: company.trim(), job_title: jobTitle.trim() })
    .eq('id', user.id)

  if (dbError) {
    logger.error('Failed to update users table', { error: dbError.message, userId: user.id })
    // Don't return error - auth was updated successfully
  }

  revalidatePath('/settings')
  return { success: true, message: 'Work information updated successfully' }
}

/**
 * Update user's email address
 * Sends a confirmation email to the new address
 */
export async function updateEmail(formData: FormData): Promise<ActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`updateEmail:${ip}`, RATE_LIMITS.signup)

  if (!rateLimitResult.allowed) {
    return { error: 'Too many requests. Please try again later.' }
  }

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update your email' }
  }

  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }

  if (email === user.email) {
    return { error: 'This is already your current email address' }
  }

  const { error } = await supabase.auth.updateUser({
    email: email.trim(),
  }, {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings`
  })

  if (error) {
    logger.error('Failed to update email', { error: error.message, userId: user.id })
    if (error.message.includes('already registered')) {
      return { error: 'This email is already registered to another account' }
    }
    return { error: 'Failed to update email. Please try again.' }
  }

  return {
    success: true,
    message: 'Confirmation email sent! Please check your inbox to verify your new email address.'
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(): Promise<ActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`passwordReset:${ip}`, RATE_LIMITS.signup)

  if (!rateLimitResult.allowed) {
    return { error: 'Too many requests. Please try again later.' }
  }

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { error: 'You must be logged in to reset your password' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/update-password`,
  })

  if (error) {
    logger.error('Failed to send password reset', { error: error.message, userId: user.id })
    return { error: 'Failed to send password reset email. Please try again.' }
  }

  return {
    success: true,
    message: 'Password reset email sent! Check your inbox for a link to set your new password.'
  }
}

/**
 * Update password (called from the password reset flow)
 */
export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rateLimitResult = checkRateLimit(`updatePassword:${ip}`, RATE_LIMITS.signup)

  if (!rateLimitResult.allowed) {
    return { error: 'Too many requests. Please try again later.' }
  }

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update your password' }
  }

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  if (!/[A-Z]/.test(password)) {
    return { error: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { error: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { error: 'Password must contain at least one number' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    logger.error('Failed to update password', { error: error.message, userId: user.id })
    return { error: 'Failed to update password. Please try again.' }
  }

  revalidatePath('/settings')
  return { success: true, message: 'Password updated successfully!' }
}
