import { getSystemHealth } from '@/lib/actions/admin'

function StatusBadge({
  status,
}: {
  status: string
}) {
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'unhealthy':
        return 'bg-red-100 text-red-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(status)}`}
    >
      {status}
    </span>
  )
}

function CircuitBreakerState({ state }: { state: string }) {
  const getStateClasses = (state: string) => {
    switch (state.toLowerCase()) {
      case 'closed':
        return 'text-green-600'
      case 'open':
        return 'text-red-600'
      case 'half-open':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <span className={`text-sm font-medium ${getStateClasses(state)}`}>
      {state}
    </span>
  )
}

export async function SystemHealth() {
  const { health, circuitBreakers, error } = await getSystemHealth()

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="font-semibold text-navy mb-4">System Health</h3>

      {error && !health && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {health && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall</span>
            <StatusBadge status={health.status} />
          </div>

          {Object.entries(health.services).map(([name, service]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground capitalize">
                {name}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={service.status} />
                {service.latency !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ({service.latency}ms)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {circuitBreakers.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">Circuit Breakers</p>
          <div className="space-y-2">
            {circuitBreakers.map((breaker) => (
              <div
                key={breaker.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{breaker.name}</span>
                <CircuitBreakerState state={breaker.state} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!health && circuitBreakers.length === 0 && !error && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No health data available
        </p>
      )}
    </div>
  )
}
