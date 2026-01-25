/**
 * Retell Web Client Library
 * Mirrors src/lib/vapi/client.ts pattern for voice practice sessions
 */

import { RetellWebClient } from 'retell-client-js-sdk'
import type { Persona, TranscriptEntry } from '@/types'

let retellInstance: RetellWebClient | null = null

export function getRetellClient(): RetellWebClient {
  if (!retellInstance) {
    retellInstance = new RetellWebClient()
  }
  return retellInstance
}

export interface RetellSessionOptions {
  persona: Persona
  scenarioType: 'cold_call' | 'objection' | 'closing' | 'gatekeeper'
  onTranscript?: (entry: TranscriptEntry) => void
  onCallStart?: (callId: string) => void
  onCallEnd?: () => void
  onError?: (error: Error) => void
}

export async function startRetellSession(options: RetellSessionOptions): Promise<string> {
  const retell = getRetellClient()
  const { persona, scenarioType, onTranscript, onCallStart, onCallEnd, onError } = options

  if (!persona.retellAgentId) {
    throw new Error('Retell agent not configured for this persona')
  }

  // Register web call via server endpoint
  const response = await fetch('/api/retell/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: persona.retellAgentId,
      metadata: {
        personaId: persona.id,
        scenarioType,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to register call' }))
    throw new Error(error.error || 'Failed to register Retell call')
  }

  const { accessToken, callId } = await response.json()

  // Set up event handlers
  retell.on('call_started', () => {
    onCallStart?.(callId)
  })

  retell.on('call_ended', () => {
    onCallEnd?.()
  })

  retell.on('update', (update) => {
    // Handle transcript updates
    if (update.transcript && update.transcript.length > 0) {
      const lastEntry = update.transcript[update.transcript.length - 1]
      if (lastEntry && lastEntry.content) {
        onTranscript?.({
          role: lastEntry.role === 'agent' ? 'assistant' : 'user',
          content: lastEntry.content,
          timestamp: Date.now(),
        })
      }
    }
  })

  retell.on('error', (error) => {
    onError?.(new Error(error.message || 'Retell error'))
  })

  // Start the call
  await retell.startCall({
    accessToken,
    sampleRate: 24000,
    captureDeviceId: 'default',
  })

  return callId
}

export function stopRetellSession(): void {
  const retell = getRetellClient()
  retell.stopCall()
}

export function muteRetellSession(muted: boolean): void {
  const retell = getRetellClient()
  if (muted) {
    retell.mute()
  } else {
    retell.unmute()
  }
}
