/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by temporarily blocking calls to failing services.
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are blocked
 * - HALF_OPEN: Testing if service has recovered
 */

import { logger } from './logger'

type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerOptions {
  /** Name of the service being protected */
  name: string
  /** Number of failures before opening the circuit */
  failureThreshold: number
  /** Time in ms before attempting to close the circuit */
  resetTimeout: number
  /** Number of successful calls in half-open state to close the circuit */
  successThreshold?: number
}

interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailure: number | null
  lastSuccess: number | null
  totalRequests: number
  totalFailures: number
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private successes = 0
  private lastFailure: number | null = null
  private lastSuccess: number | null = null
  private totalRequests = 0
  private totalFailures = 0
  private readonly options: Required<CircuitBreakerOptions>

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      successThreshold: 2,
      ...options,
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++

    // Check if circuit should transition from open to half-open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - (this.lastFailure || 0)
      if (timeSinceLastFailure >= this.options.resetTimeout) {
        this.transitionTo('half-open')
      } else {
        throw new CircuitOpenError(
          `Circuit breaker "${this.options.name}" is open. Retry after ${Math.ceil(
            (this.options.resetTimeout - timeSinceLastFailure) / 1000
          )}s`
        )
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error)
      throw error
    }
  }

  /**
   * Check if the circuit is currently allowing requests
   */
  isAvailable(): boolean {
    if (this.state === 'closed') return true
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - (this.lastFailure || 0)
      return timeSinceLastFailure >= this.options.resetTimeout
    }
    return true // half-open allows requests
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
    }
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.transitionTo('closed')
    this.failures = 0
    this.successes = 0
  }

  private onSuccess(): void {
    this.lastSuccess = Date.now()

    if (this.state === 'half-open') {
      this.successes++
      if (this.successes >= this.options.successThreshold) {
        this.transitionTo('closed')
      }
    } else if (this.state === 'closed') {
      // Reset failure count on success
      this.failures = 0
    }
  }

  private onFailure(error: unknown): void {
    this.failures++
    this.totalFailures++
    this.lastFailure = Date.now()

    logger.warn(`Circuit breaker "${this.options.name}" recorded failure`, {
      operation: this.options.name,
      error: error instanceof Error ? error.message : String(error),
    })

    if (this.state === 'half-open') {
      // Any failure in half-open state opens the circuit again
      this.transitionTo('open')
    } else if (this.state === 'closed') {
      if (this.failures >= this.options.failureThreshold) {
        this.transitionTo('open')
      }
    }
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      logger.info(`Circuit breaker "${this.options.name}" state change`, {
        operation: this.options.name,
        from: this.state,
        to: newState,
      })
      this.state = newState

      if (newState === 'closed') {
        this.failures = 0
        this.successes = 0
      } else if (newState === 'half-open') {
        this.successes = 0
      }
    }
  }
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitOpenError'
  }
}

// Pre-configured circuit breakers for common services
export const openaiCircuit = new CircuitBreaker({
  name: 'openai',
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
})

export const openrouterCircuit = new CircuitBreaker({
  name: 'openrouter',
  failureThreshold: 5,
  resetTimeout: 30000,
  successThreshold: 2,
})

export const vapiCircuit = new CircuitBreaker({
  name: 'vapi',
  failureThreshold: 3,
  resetTimeout: 60000, // 1 minute
  successThreshold: 2,
})

export const supabaseCircuit = new CircuitBreaker({
  name: 'supabase',
  failureThreshold: 5,
  resetTimeout: 15000, // 15 seconds
  successThreshold: 3,
})
