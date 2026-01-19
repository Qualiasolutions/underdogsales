'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1.5rem',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
            backgroundColor: '#0a0a0a',
            color: '#fafafa',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              Something went wrong
            </h2>
            <p style={{ color: '#a1a1aa', maxWidth: '24rem', margin: 0 }}>
              A critical error occurred. Please refresh the page to try again.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#71717a', margin: 0 }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#fafafa',
                color: '#0a0a0a',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #27272a',
                backgroundColor: 'transparent',
                color: '#fafafa',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
