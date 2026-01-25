import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  services: {
    supabase: ServiceStatus
    openai: ServiceStatus
    openrouter: ServiceStatus
  }
}

const startTime = Date.now()

async function checkSupabase(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const supabase = getAdminClient()

    // Simple query to verify connection
    const { error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        error: error.message,
      }
    }

    return {
      status: 'healthy',
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkOpenAI(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { status: 'unhealthy', error: 'API key not configured' }
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    return {
      status: response.ok ? 'healthy' : 'degraded',
      latency: Date.now() - start,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkOpenRouter(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return { status: 'unhealthy', error: 'API key not configured' }
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    return {
      status: response.ok ? 'healthy' : 'degraded',
      latency: Date.now() - start,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function GET() {
  const [supabase, openai, openrouter] = await Promise.all([
    checkSupabase(),
    checkOpenAI(),
    checkOpenRouter(),
  ])

  const services = { supabase, openai, openrouter }

  // Determine overall status
  // OpenAI is optional if OpenRouter is available (OpenRouter is primary LLM provider)
  const criticalServices = [supabase, openrouter]
  const optionalServices = [openai]

  let overallStatus: HealthCheck['status'] = 'healthy'

  // Check critical services first
  if (criticalServices.some((s) => s.status === 'unhealthy')) {
    overallStatus = 'unhealthy'
  } else if (criticalServices.some((s) => s.status === 'degraded')) {
    overallStatus = 'degraded'
  }
  // Only check optional services if critical are healthy
  else if (optionalServices.some((s) => s.status === 'degraded')) {
    overallStatus = 'degraded'
  }
  // OpenAI unhealthy is OK if OpenRouter is healthy

  const health: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
