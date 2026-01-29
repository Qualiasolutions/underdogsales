import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/supabase/server'
import { isAdmin } from '@/config/admin'

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
}

interface DetailedHealthCheck extends HealthCheck {
  version: string
  uptime: number
  services: {
    supabase: ServiceStatus
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

export async function GET(request: NextRequest) {
  // Check if user is admin for detailed health info
  const user = await getUser()
  const showDetails = user && isAdmin(user.email)

  // If requesting detailed info via query param, require admin
  const wantsDetails = request.nextUrl.searchParams.get('details') === 'true'

  if (wantsDetails && !showDetails) {
    // Return basic status only for non-admins
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    } as HealthCheck)
  }

  const [supabase, openrouter] = await Promise.all([
    checkSupabase(),
    checkOpenRouter(),
  ])

  const services = { supabase, openrouter }

  // Determine overall status - both services are critical
  const allServices = [supabase, openrouter]

  let overallStatus: HealthCheck['status'] = 'healthy'

  if (allServices.some((s) => s.status === 'unhealthy')) {
    overallStatus = 'unhealthy'
  } else if (allServices.some((s) => s.status === 'degraded')) {
    overallStatus = 'degraded'
  }

  // Return minimal info for public requests, detailed for admins
  if (!showDetails) {
    const basicHealth: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
    }
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503
    return NextResponse.json(basicHealth, { status: statusCode })
  }

  // Admin gets full details
  const health: DetailedHealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
