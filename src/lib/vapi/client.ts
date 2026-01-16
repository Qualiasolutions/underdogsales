import Vapi from '@vapi-ai/web'
import type { Persona, VapiCallEvent, TranscriptEntry } from '@/types'

// Giulio - Underdog Sales Coach Assistant ID
const GIULIO_ASSISTANT_ID = '45223924-49cd-43ab-8e6c-eea4c77d67c5'

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
  const { persona, scenarioType, onTranscript, onCallStart, onCallEnd, onError } = options

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
        role: message.role === 'user' ? 'user' : 'assistant',
        content: message.transcript,
        timestamp: Date.now(),
      })
    }
  })

  vapi.on('error', (error: Error) => {
    onError?.(error)
  })

  try {
    // Use pre-configured Giulio assistant with variable overrides
    await vapi.start(GIULIO_ASSISTANT_ID, {
      variableValues: {
        persona_name: persona.name,
        persona_role: persona.role,
        persona_warmth: String(persona.warmth),
        scenario_type: scenarioType,
        difficulty: getDifficultyFromWarmth(persona.warmth),
      },
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

function getDifficultyFromWarmth(warmth: number): string {
  if (warmth >= 0.6) return 'easy'
  if (warmth >= 0.35) return 'medium'
  return 'hard'
}
