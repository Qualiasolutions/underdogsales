/**
 * AI Persona Generator
 * Takes ICP conversation context and generates a custom roleplay persona
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUser, createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const GenerateRequestSchema = z.object({
  icpData: z.object({
    product: z.string().min(1),
    targetAudience: z.string().min(1),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
    existingCustomers: z.string().optional(),
    additionalContext: z.string().optional(),
  }),
})

function getOpenRouterClient() {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }
  return new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    timeout: 30000,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsales.vercel.app',
      'X-Title': 'Underdog Sales Coach',
    },
  })
}

const PERSONA_GENERATION_PROMPT = `You are an expert at creating realistic sales roleplay personas. Based on the ICP (Ideal Customer Profile) data provided, generate a challenging but realistic prospect persona for cold call practice.

The persona should:
1. Be skeptical and busy (like real prospects)
2. Have realistic objections based on their role and industry
3. Start cold/dismissive but can warm up if the caller is skilled
4. Have a clear background and current situation that informs their behavior

Output ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "role": "Job Title",
  "company": "Company Name (realistic for their industry)",
  "industry": "Industry",
  "personality": "2-3 sentence personality description - how they behave on calls",
  "background": "Brief professional background and current situation",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "objections": ["objection 1", "objection 2", "objection 3", "objection 4"],
  "warmth": 0.2,
  "systemPrompt": "Full system prompt for the AI to roleplay this character (detailed, 200+ words)"
}

The systemPrompt should include:
- Character identity and background
- How to answer the phone (no long introductions)
- Tone and speaking style
- Specific objections to use
- When/how to soften if the caller does well
- Industry-specific context`

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = GenerateRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { icpData } = validation.data

    logger.info('Generating custom persona', {
      userId: user.id,
      industry: icpData.industry,
      product: icpData.product.substring(0, 50),
    })

    const client = getOpenRouterClient()

    const userPrompt = `Generate a roleplay persona based on this ICP:

**Product/Service:** ${icpData.product}
**Target Audience:** ${icpData.targetAudience}
**Industry:** ${icpData.industry || 'Not specified'}
**Company Size:** ${icpData.companySize || 'Not specified'}
**Pain Points:** ${icpData.painPoints?.join(', ') || 'Not specified'}
**Existing Customers:** ${icpData.existingCustomers || 'Not specified'}
**Additional Context:** ${icpData.additionalContext || 'None'}

Create a realistic, challenging prospect persona that would be a good fit for this product but is initially skeptical/busy like real cold call prospects.`

    const response = await client.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: PERSONA_GENERATION_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse the JSON response
    let personaData
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      personaData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      logger.error('Failed to parse persona JSON', { content, error: String(parseError) })
      throw new Error('Failed to parse generated persona')
    }

    // Save to database
    const supabase = await createServerSupabaseClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: persona, error: dbError } = await (supabase as any)
      .from('custom_personas')
      .insert({
        user_id: user.id,
        name: personaData.name,
        role: personaData.role,
        company: personaData.company,
        industry: personaData.industry,
        personality: personaData.personality,
        background: personaData.background,
        pain_points: personaData.painPoints,
        objections: personaData.objections,
        warmth: personaData.warmth,
        system_prompt: personaData.systemPrompt,
        icp_context: icpData,
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Failed to save persona', { error: dbError })
      throw new Error('Failed to save persona')
    }

    logger.info('Custom persona created', {
      userId: user.id,
      personaId: persona.id,
      name: persona.name,
    })

    return NextResponse.json({
      success: true,
      persona: {
        id: persona.id,
        name: persona.name,
        role: persona.role,
        company: persona.company,
        industry: persona.industry,
        personality: persona.personality,
        background: persona.background,
        painPoints: persona.pain_points,
        objections: persona.objections,
      },
    })
  } catch (error) {
    logger.exception('Persona generation failed', error)
    return NextResponse.json(
      { error: 'Failed to generate persona' },
      { status: 500 }
    )
  }
}
