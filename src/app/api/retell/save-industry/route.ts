/**
 * Retell Tool Webhook - Save Industry
 * Called by the onboarding agent to save user's industry selection
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const VALID_INDUSTRIES = [
  'saas_tech',
  'healthcare',
  'finance',
  'real_estate',
  'manufacturing',
  'professional_services',
] as const

// Industry display names for confirmation
const INDUSTRY_NAMES: Record<string, string> = {
  saas_tech: 'SaaS and Tech',
  healthcare: 'Healthcare',
  finance: 'Finance',
  real_estate: 'Real Estate',
  manufacturing: 'Manufacturing',
  professional_services: 'Professional Services',
}

interface RetellToolRequest {
  call_id: string
  args: {
    industry: string
  }
  metadata?: {
    userId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RetellToolRequest = await request.json()

    logger.info('Save industry webhook called', {
      operation: 'save_industry_webhook',
      callId: body.call_id,
      industry: body.args?.industry,
      metadata: body.metadata,
    })

    const { industry } = body.args || {}
    const userId = body.metadata?.userId

    if (!userId) {
      logger.warn('No userId in metadata', { operation: 'save_industry_webhook', callId: body.call_id })
      return NextResponse.json({
        response: "I couldn't save your selection. Please try again from the website."
      })
    }

    // Normalize industry input
    const normalizedIndustry = industry?.toLowerCase().replace(/[\s-]/g, '_')

    if (!normalizedIndustry || !VALID_INDUSTRIES.includes(normalizedIndustry as typeof VALID_INDUSTRIES[number])) {
      logger.warn('Invalid industry', {
        operation: 'save_industry_webhook',
        industry,
        normalizedIndustry,
      })
      return NextResponse.json({
        response: "I didn't catch that industry. Could you say it again? Options are: SaaS, Healthcare, Finance, Real Estate, Manufacturing, or Professional Services."
      })
    }

    // Save to database
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('users')
      .update({ industry: normalizedIndustry })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to save industry', {
        operation: 'save_industry_webhook',
        userId,
        error: error.message,
      })
      return NextResponse.json({
        response: "There was an error saving your selection. Let's continue anyway - you can update this in settings later."
      })
    }

    logger.info('Industry saved successfully', {
      operation: 'save_industry_webhook',
      userId,
      industry: normalizedIndustry,
    })

    const industryName = INDUSTRY_NAMES[normalizedIndustry] || normalizedIndustry

    return NextResponse.json({
      response: `Perfect! I've set your industry to ${industryName}. Your practice sessions will now include ${industryName}-specific objections and scenarios. Head to the practice page when you're ready to start!`
    })
  } catch (error) {
    logger.exception('Save industry webhook error', error)
    return NextResponse.json({
      response: "Something went wrong. Please try again."
    })
  }
}
