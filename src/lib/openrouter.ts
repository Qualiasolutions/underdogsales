/**
 * OpenRouter API Client
 * Uses GPT-4o for intelligent call analysis
 */

import { logger } from '@/lib/logger'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function callOpenRouter(
  messages: Message[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const {
    model = 'openai/gpt-4o',
    temperature = 0.3,
    maxTokens = 2000,
  } = options

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsales.vercel.app',
        'X-Title': 'Underdog Sales Coach',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('OpenRouter API error', {
        operation: 'callOpenRouter',
        status: response.status,
        error: errorText,
      })
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data: OpenRouterResponse = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content in OpenRouter response')
    }

    return data.choices[0].message.content
  } catch (error) {
    logger.exception('OpenRouter call failed', error, { operation: 'callOpenRouter' })
    throw error
  }
}
