import Vapi from '@vapi-ai/web'
import type { Persona, VapiCallEvent, TranscriptEntry } from '@/types'
import { getPersonaPrompt } from '@/config/personas'

let vapiInstance: Vapi | null = null

export function getVapiClient(): Vapi {
  if (!vapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    if (!publicKey) {
      throw new Error('VAPI public key not configured')
    }
    vapiInstance = new Vapi(publicKey)
  }
  return vapiInstance
}

export interface RoleplaySessionOptions {
  persona: Persona
  scenarioType: 'cold_call' | 'objection' | 'closing' | 'gatekeeper'
  userContext?: string
  onTranscript?: (entry: TranscriptEntry) => void
  onCallStart?: (callId: string) => void
  onCallEnd?: (analysis: unknown) => void
  onError?: (error: Error) => void
}

export async function startRoleplaySession(options: RoleplaySessionOptions): Promise<string> {
  const vapi = getVapiClient()
  const { persona, scenarioType, userContext, onTranscript, onCallStart, onCallEnd, onError } = options

  const systemPrompt = buildSystemPrompt(persona, scenarioType, userContext)

  // Set up event handlers
  vapi.on('call-start', () => {
    const callId = (vapi as unknown as { call?: { id: string } }).call?.id || 'unknown'
    onCallStart?.(callId)
  })

  vapi.on('call-end', () => {
    onCallEnd?.(null)
  })

  vapi.on('message', (message: VapiCallEvent) => {
    if (message.type === 'transcript' && message.transcript) {
      onTranscript?.({
        role: 'assistant',
        content: message.transcript,
        timestamp: Date.now(),
      })
    }
  })

  vapi.on('error', (error: Error) => {
    onError?.(error)
  })

  try {
    await vapi.start({
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.8,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
      },
      voice: {
        provider: '11labs',
        voiceId: persona.voiceId,
        stability: 0.5,
        similarityBoost: 0.8,
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-3',
        language: 'en',
      },
      name: `${persona.name} - ${scenarioType}`,
      firstMessage: getFirstMessage(persona, scenarioType),
    })

    return (vapi as unknown as { call?: { id: string } }).call?.id || 'started'
  } catch (error) {
    onError?.(error as Error)
    throw error
  }
}

export function stopRoleplaySession(): void {
  const vapi = getVapiClient()
  vapi.stop()
}

export function muteRoleplaySession(muted: boolean): void {
  const vapi = getVapiClient()
  vapi.setMuted(muted)
}

function buildSystemPrompt(
  persona: Persona,
  scenarioType: string,
  userContext?: string
): string {
  const basePrompt = getPersonaPrompt(persona.id)

  const scenarioContext = getScenarioContext(scenarioType)

  return `${basePrompt}

## Scenario Context
${scenarioContext}

${userContext ? `## Additional Context\n${userContext}` : ''}

## Behavior Guidelines
- Stay in character throughout the conversation
- Respond naturally based on your persona's personality
- Use your configured objections when appropriate
- If the salesperson does something well, acknowledge it subtly (don't break character)
- If they make a mistake, react as your character would
- Keep responses conversational (2-4 sentences typically)
- Allow the salesperson to practice the full call structure
- End the call if they successfully close OR if you've rejected them convincingly

## Important
You are playing a prospect in a sales training roleplay. Your goal is to provide realistic practice.
Do NOT:
- Break character to give feedback
- Be unrealistically easy or hard
- Ignore good technique
- Rush to conclusions`
}

function getScenarioContext(scenarioType: string): string {
  const contexts: Record<string, string> = {
    cold_call: `This is a cold call scenario. You (the prospect) have been interrupted during your workday.
You have no prior relationship with the caller. React naturally to their opener and pitch.
Your company does have some of the problems they might mention, but you're initially skeptical.`,

    objection: `This is an objection handling practice scenario. The salesperson will pitch you something.
Your job is to raise realistic objections based on your persona. Give them a chance to handle each objection.
If they handle it well, you can soften slightly. If they handle it poorly, you can become more resistant.`,

    closing: `This is a closing practice scenario. Assume the salesperson has already done good discovery.
They've established that you have a problem worth solving. Now they're trying to get a meeting.
Resist their close attempts initially, but be open to good closing technique.`,

    gatekeeper: `This is a gatekeeper scenario. You are the assistant/receptionist protecting your boss.
Your job is to screen calls. Be helpful but protective. Only let through callers who demonstrate value
or who handle the gatekeeper interaction skillfully.`,
  }

  return contexts[scenarioType] || contexts.cold_call
}

function getFirstMessage(persona: Persona, scenarioType: string): string {
  if (scenarioType === 'gatekeeper') {
    return `Good ${getTimeOfDay()}, ${persona.role.toLowerCase()} speaking. How can I help you?`
  }

  const warmthResponses = {
    low: ['Hello?', 'Yes?', "Who's this?"],
    medium: ['Hello, speaking.', 'Yes, this is they.', 'Hello?'],
    high: [`Hi there, ${persona.name} speaking!`, 'Hello, how can I help?'],
  }

  const warmthLevel = persona.warmth < 0.4 ? 'low' : persona.warmth < 0.7 ? 'medium' : 'high'
  const responses = warmthResponses[warmthLevel]

  return responses[Math.floor(Math.random() * responses.length)]
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
