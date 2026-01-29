/**
 * ICP Builder Chat API
 * Conversational AI that gathers ICP information through questions
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
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

const ICP_BUILDER_SYSTEM_PROMPT = `You are an ICP (Ideal Customer Profile) builder assistant for Underdog Sales. Your job is to gather information to create a realistic roleplay persona for cold call practice.

## YOUR APPROACH
- Be conversational and helpful, like a friendly sales coach
- Ask ONE question at a time
- After each answer, briefly acknowledge it and ask the next question
- Keep responses SHORT (2-3 sentences max)

## INFORMATION TO GATHER (in order)
1. **Product/Service**: What do they sell? (E.g., SaaS, consulting, etc.)
2. **Target Audience**: Who are they selling to? (Job titles, industries, company sizes)
3. **Specific Niche/Vertical**: Any particular industry or segment?
4. **Their Story**: What's their background? What makes them credible?
5. **Key Pain Points**: What problems does their solution solve?

## WHEN YOU HAVE ENOUGH INFO
When you've gathered at least: product, target audience, and some context about pain points or their story, tell them you're ready to generate their custom persona.

End your message with EXACTLY this format (on its own line):
[READY_TO_GENERATE]

Then include a JSON summary of what you gathered:
\`\`\`json
{
  "product": "what they sell",
  "targetAudience": "who they sell to",
  "industry": "target industry if mentioned",
  "companySize": "target company size if mentioned",
  "painPoints": ["pain point 1", "pain point 2"],
  "existingCustomers": "any mentioned customers or similar companies",
  "additionalContext": "any other relevant info"
}
\`\`\`

## EXAMPLE FLOW
User: "I'm an AE working for ZoomInfo"
You: "Got it - you're selling ZoomInfo's data/intelligence platform! Who are you typically calling? (E.g., Sales leaders, Marketing directors, specific industries?)"

User: "VP of Sales at mid-market tech companies"
You: "Perfect - VP of Sales at mid-market tech companies. What's usually the biggest pain point or trigger that makes them interested in ZoomInfo?"

## RULES
- Never be generic - tailor everything to their specific situation
- If they mention a well-known company, use that context
- Keep it moving - don't over-explain
- Be encouraging but efficient`

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = ChatRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { messages } = validation.data

    const client = getOpenRouterClient()

    const response = await client.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: ICP_BUILDER_SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content || 'Sorry, I couldn\'t respond.'

    // Check if ready to generate
    const isReady = content.includes('[READY_TO_GENERATE]')
    let icpData = null

    if (isReady) {
      // Extract JSON from response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        try {
          icpData = JSON.parse(jsonMatch[1])
        } catch (e) {
          logger.warn('Failed to parse ICP JSON', { error: String(e) })
        }
      }
    }

    // Clean the message for display (remove the marker and JSON)
    let displayMessage = content
      .replace('[READY_TO_GENERATE]', '')
      .replace(/```json[\s\S]*?```/g, '')
      .trim()

    return NextResponse.json({
      message: displayMessage,
      isReady,
      icpData,
    })
  } catch (error) {
    logger.exception('ICP chat failed', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
