import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const GenerateSchema = z.object({
  company: z.string().min(2),
  targetRole: z.string().min(2),
  forceRefresh: z.boolean().optional(),
})

export interface ICPContext {
  company: string
  targetRole: string
  companyDescription: string
  painPoints: string[]
  valueProps: string[]
  suggestedOpener: string
  generatedAt: string
}

/**
 * Use Perplexity/Sonar via OpenRouter to research the company and target role
 */
async function researchCompanyAndRole(company: string, targetRole: string): Promise<ICPContext | null> {
  if (!OPENROUTER_API_KEY) {
    logger.warn('No OpenRouter API key for ICP generation')
    return null
  }

  try {
    const prompt = `Research the company "${company}" and provide information for a salesperson selling to a ${targetRole}:

1. What does ${company} do? (1-2 sentences)
2. What are the top 3-4 pain points a ${targetRole} typically faces that ${company}'s products/services could address?
3. What are 2-3 key value propositions that would resonate with a ${targetRole}?
4. Suggest a brief, natural cold call opener for reaching a ${targetRole} at a company similar to their prospects.

Be specific and practical. Focus on real business challenges.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsales.vercel.app',
        'X-Title': 'Underdog Sales Coach',
      },
      body: JSON.stringify({
        model: 'perplexity/sonar',
        messages: [
          {
            role: 'system',
            content: `You are a sales research assistant. Provide detailed, factual information about companies and target personas. Format your response as JSON with this structure:
{
  "companyDescription": "Brief description of what the company does",
  "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
  "valueProps": ["Value prop 1", "Value prop 2"],
  "suggestedOpener": "A natural cold call opener"
}
Only respond with valid JSON.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      logger.error('ICP research failed', { status: response.status })
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      logger.error('No content in ICP research response')
      return null
    }

    // Parse JSON response
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        company,
        targetRole,
        companyDescription: parsed.companyDescription || `${company} is a company in its industry.`,
        painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
        valueProps: Array.isArray(parsed.valueProps) ? parsed.valueProps : [],
        suggestedOpener: parsed.suggestedOpener || '',
        generatedAt: new Date().toISOString(),
      }
    } catch (parseError) {
      logger.error('Failed to parse ICP research JSON', { content, parseError: String(parseError) })
      // Return a fallback structure
      return {
        company,
        targetRole,
        companyDescription: `You work for ${company}.`,
        painPoints: [
          `${targetRole}s often struggle with hitting their targets`,
          `${targetRole}s need better data and insights`,
          `${targetRole}s want to improve team efficiency`,
        ],
        valueProps: [
          `Help ${targetRole}s achieve their goals faster`,
          `Provide actionable insights for decision-making`,
        ],
        suggestedOpener: `Hi, I'm reaching out because I work with ${targetRole}s and wanted to see if you're facing any challenges with [relevant problem].`,
        generatedAt: new Date().toISOString(),
      }
    }
  } catch (error) {
    logger.exception('ICP research error', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validation = GenerateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { company, targetRole, forceRefresh } = validation.data
    const supabase = getAdminClient()

    // Check for cached ICP context if not forcing refresh
    if (!forceRefresh) {
      const { data: userData } = await supabase
        .from('users')
        .select('icp_context')
        .eq('id', user.id)
        .single()

      const cachedContext = userData?.icp_context as ICPContext | null

      // Return cached if exists and matches current profile
      if (
        cachedContext &&
        cachedContext.company === company &&
        cachedContext.targetRole === targetRole
      ) {
        logger.info('Returning cached ICP context', {
          operation: 'generateICP',
          userId: user.id,
          cached: true,
        })
        return NextResponse.json({ icpContext: cachedContext, cached: true })
      }
    }

    // Generate new ICP context
    logger.info('Generating new ICP context', {
      operation: 'generateICP',
      userId: user.id,
      company,
      targetRole,
    })

    const icpContext = await researchCompanyAndRole(company, targetRole)

    if (!icpContext) {
      return NextResponse.json(
        { error: 'Failed to generate ICP context' },
        { status: 500 }
      )
    }

    // Cache the result (cast to any to satisfy Supabase types)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('users') as any)
      .update({ icp_context: icpContext })
      .eq('id', user.id)

    return NextResponse.json({ icpContext, cached: false })
  } catch (error) {
    logger.exception('ICP generation error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
