import crypto from 'crypto'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Verify VAPI webhook/tool signature using HMAC SHA-256
 * Returns true if signature is valid, false otherwise
 */
export function verifyVapiSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Verify VAPI request and return error response if invalid
 * Returns null if verification passes, or error response if it fails
 */
export function verifyVapiRequest(
  rawBody: string,
  signatureHeader: string | null
): { error: string; status: number } | null {
  // Skip verification in development
  if (isDev) {
    return null
  }

  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET

  if (!verifyVapiSignature(rawBody, signatureHeader, webhookSecret)) {
    return { error: 'Invalid webhook signature', status: 401 }
  }

  return null
}
