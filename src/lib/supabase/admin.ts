/**
 * Supabase Admin Client
 *
 * Uses service role key to bypass RLS for server-side operations.
 * IMPORTANT: Only use this in server-side code (API routes, server actions).
 * Always verify user authorization before performing operations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Singleton instance for connection reuse
let adminClient: SupabaseClient<Database> | null = null

/**
 * Get the admin Supabase client (bypasses RLS)
 *
 * Use this for server-side operations that need elevated permissions.
 * Always verify user authorization before performing operations.
 *
 * @example
 * ```ts
 * const supabase = getAdminClient()
 * const { data } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('id', userId)
 * ```
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (adminClient) {
    return adminClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  adminClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}

/**
 * Create a fresh admin client (not singleton)
 *
 * Use this when you need a separate client instance,
 * such as in edge functions or when testing.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
