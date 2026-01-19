/**
 * Structured error codes and user-friendly messages
 */

export const ErrorCodes = {
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_LOST: 'CONNECTION_LOST',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Validation
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_CALL_ID: 'INVALID_CALL_ID',

  // Processing
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  SCORING_FAILED: 'SCORING_FAILED',
  PROCESSING_TIMEOUT: 'PROCESSING_TIMEOUT',

  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_PROCESSED: 'ALREADY_PROCESSED',

  // Server
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * User-friendly error messages
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Unable to connect. Check your internet connection.',
  [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.CONNECTION_LOST]: 'Connection lost. Attempting to reconnect...',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Unsupported file type. Use MP3, WAV, WebM, OGG, or M4A.',
  [ErrorCodes.FILE_TOO_LARGE]: 'File too large. Maximum size is 100MB.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input. Please check your data.',
  [ErrorCodes.INVALID_CALL_ID]: 'Invalid call ID format.',
  [ErrorCodes.UPLOAD_FAILED]: 'Failed to upload file. Please try again.',
  [ErrorCodes.TRANSCRIPTION_FAILED]: 'Failed to transcribe audio. Try a clearer recording.',
  [ErrorCodes.SCORING_FAILED]: 'Failed to analyze call. Please try again.',
  [ErrorCodes.PROCESSING_TIMEOUT]: 'Processing took too long. Please try again.',
  [ErrorCodes.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.NOT_FOUND]: 'Resource not found.',
  [ErrorCodes.ALREADY_PROCESSED]: 'This call has already been processed.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Try again in a few minutes.',
  [ErrorCodes.INTERNAL_ERROR]: 'Something went wrong. Please try again.',
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string
  code?: ErrorCode
  details?: string
  retryAfter?: number // seconds
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  code: ErrorCode,
  details?: string,
  retryAfter?: number
): ApiErrorResponse {
  return {
    error: ErrorMessages[code],
    code,
    details,
    retryAfter,
  }
}

/**
 * Application error class with code
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public details?: string
  ) {
    super(message || ErrorMessages[code])
    this.name = 'AppError'
  }
}

/**
 * Map HTTP status to error code
 */
export function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCodes.INVALID_INPUT
    case 401:
      return ErrorCodes.UNAUTHORIZED
    case 403:
      return ErrorCodes.UNAUTHORIZED
    case 404:
      return ErrorCodes.NOT_FOUND
    case 408:
      return ErrorCodes.TIMEOUT
    case 429:
      return ErrorCodes.RATE_LIMITED
    case 502:
    case 503:
    case 504:
      return ErrorCodes.SERVICE_UNAVAILABLE
    default:
      return ErrorCodes.INTERNAL_ERROR
  }
}

/**
 * Extract user-friendly message from error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ErrorMessages[error.code]
  }

  if (error instanceof Error) {
    // Check for known error patterns
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return ErrorMessages[ErrorCodes.TIMEOUT]
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ErrorMessages[ErrorCodes.NETWORK_ERROR]
    }
    return error.message
  }

  return ErrorMessages[ErrorCodes.INTERNAL_ERROR]
}
