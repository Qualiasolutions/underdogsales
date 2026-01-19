/**
 * Structured logging utility for production observability
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  userId?: string
  operation?: string
  duration?: number
  statusCode?: number
  path?: string
  method?: string
  error?: string
  stack?: string
  [key: string]: unknown
}

interface LogEntry extends LogContext {
  timestamp: string
  level: LogLevel
  message: string
  env: string
}

const isDev = process.env.NODE_ENV === 'development'

function formatLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    env: process.env.NODE_ENV || 'development',
    ...context,
  }
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = formatLogEntry(level, message, context)

  if (isDev) {
    // Pretty print in development
    const color = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    }[level]
    const reset = '\x1b[0m'

    console[level](
      `${color}[${level.toUpperCase()}]${reset} ${message}`,
      context ? context : ''
    )
  } else {
    // JSON in production for log aggregation
    console[level](JSON.stringify(entry))
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDev) log('debug', message, context)
  },
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  /**
   * Log an API request with timing
   */
  request: (
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: Omit<LogContext, 'method' | 'path' | 'statusCode' | 'duration'>
  ) => {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    log(level, `${method} ${path} ${statusCode}`, {
      method,
      path,
      statusCode,
      duration,
      ...context,
    })
  },

  /**
   * Log an error with stack trace
   */
  exception: (message: string, error: unknown, context?: LogContext) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    log('error', message, {
      error: errorMessage,
      stack,
      ...context,
    })
  },
}

export type { LogContext, LogEntry }
