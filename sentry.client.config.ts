import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when errors occur

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out known non-issues
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // User abort
    'AbortError',
    'The operation was aborted',
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
})
