/**
 * Fetch utilities with timeout and error handling
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number // milliseconds
}

/**
 * Fetch with configurable timeout
 * Throws AbortError if request exceeds timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = TIMEOUTS.DEFAULT, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Request timed out after ${timeout}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Service-specific timeout configurations (milliseconds)
 */
export const TIMEOUTS = {
  WHISPER: 180000,     // 3 min - long audio transcription
  OPENAI_CHAT: 30000,  // 30s - chat completions
  EMBEDDINGS: 20000,   // 20s - OpenRouter embeddings
  SUPABASE_RPC: 15000, // 15s - database RPC calls
  UPLOAD: 60000,       // 60s - file uploads
  SSE: 45000,          // 45s - SSE connection before fallback
  DEFAULT: 30000,      // 30s - default timeout
} as const

/**
 * Custom timeout error
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError ||
    (error instanceof Error && error.name === 'AbortError')
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message.includes('fetch failed') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch') ||
    error.name === 'TypeError'
  )
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
