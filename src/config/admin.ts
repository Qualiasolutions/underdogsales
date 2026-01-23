/**
 * Admin Configuration
 *
 * Simple email-based admin check. Add emails to the whitelist
 * to grant admin access.
 */

export const ADMIN_EMAILS = [
  'fawzi@qualiasolutions.io',
  // Add more admin emails as needed
] as const

/**
 * Check if an email has admin privileges
 */
export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number])
}
