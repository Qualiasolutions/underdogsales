import Vapi from '@vapi-ai/web'
import type { Persona, VapiCallEvent, TranscriptEntry } from '@/types'

// Giulio - Underdog Sales Coach Assistant ID
const GIULIO_ASSISTANT_ID = '45223924-49cd-43ab-8e6c-eea4c77d67c5'

let vapiInstance: Vapi | null = null

// Store current event handlers to remove them before adding new ones
let currentHandlers: {
  callStart?: () => void
  callEnd?: () => void
  message?: (message: VapiCallEvent) => void
  error?: (error: Error) => void
} = {}

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

// Clean up previous event listeners to prevent duplicates
function cleanupEventListeners(vapi: Vapi): void {
  if (currentHandlers.callStart) {
    vapi.off('call-start', currentHandlers.callStart)
  }
  if (currentHandlers.callEnd) {
    vapi.off('call-end', currentHandlers.callEnd)
  }
  if (currentHandlers.message) {
    vapi.off('message', currentHandlers.message)
  }
  if (currentHandlers.error) {
    vapi.off('error', currentHandlers.error)
  }
  currentHandlers = {}
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

  // Clean up any previous event listeners to prevent duplicates
  cleanupEventListeners(vapi)

  // Create and store new event handlers
  currentHandlers.callStart = () => {
    const callId = (vapi as unknown as { call?: { id: string } }).call?.id || 'unknown'
    onCallStart?.(callId)
  }

  currentHandlers.callEnd = () => {
    onCallEnd?.(null)
  }

  currentHandlers.message = (message: VapiCallEvent) => {
    if (message.type === 'transcript' && message.transcript && message.transcriptType === 'final') {
      onTranscript?.({
        role: message.role || 'assistant',
        content: message.transcript,
        timestamp: Date.now(),
      })
    }
  }

  currentHandlers.error = (error: Error) => {
    onError?.(error)
  }

  // Register event handlers
  vapi.on('call-start', currentHandlers.callStart)
  vapi.on('call-end', currentHandlers.callEnd)
  vapi.on('message', currentHandlers.message)
  vapi.on('error', currentHandlers.error)

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
