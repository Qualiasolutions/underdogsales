import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ],
})
