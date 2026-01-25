/**
 * Retell Webhook Authentication
 * Verifies webhook signatures for Retell callbacks
 */

import Retell from 'retell-sdk'
import { logger } from '@/lib/logger'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Verify Retell webhook signature
 * Returns true if signature is valid, false otherwise
 */
export function verifyRetellSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const apiKey = process.env.RETELL_API_KEY

  if (!apiKey) {
    logger.warn('RETELL_API_KEY not configured, skipping signature verification')
    return false
  }

  if (!signature) {
    logger.warn('No signature provided in webhook request')
    return false
  }

  try {
    // Retell.verify(body, apiKey, signature) -> boolean
    return Retell.verify(rawBody, apiKey, signature)
  } catch (error) {
    logger.error('Retell signature verification failed', { error: String(error) })
    return false
  }
}

/**
 * Verify Retell request and return error response if invalid
 * Returns null if verification passes, or error response if it fails
 */
export function verifyRetellRequest(
  rawBody: string,
  signatureHeader: string | null
): { error: string; status: number } | null {
  // Skip verification in development
  if (isDev) {
    return null
  }

  if (!verifyRetellSignature(rawBody, signatureHeader)) {
    return { error: 'Invalid webhook signature', status: 401 }
  }

  return null
}
