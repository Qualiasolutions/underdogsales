/**
 * Retell Web Client Library
 * Mirrors src/lib/vapi/client.ts pattern for voice practice sessions
 *
 * Note: Retell's update event contains the last 5 sentences only.
 * We track seen content hashes to deduplicate transcript entries.
 */

import { RetellWebClient } from 'retell-client-js-sdk'
import type { Persona, TranscriptEntry } from '@/types'

// Track seen transcript entries to prevent duplicates
// Key: hash of role + content, Value: timestamp
let seenTranscripts = new Set<string>()

// Current session's accumulated transcript
let currentTranscript: TranscriptEntry[] = []

// Retell client instance - recreated for each call to ensure clean event handlers
let retellInstance: RetellWebClient | null = null

function createRetellClient(): RetellWebClient {
  // Always create a fresh instance to avoid stale event handlers
  retellInstance = new RetellWebClient()
  return retellInstance
}

export function getRetellClient(): RetellWebClient {
  if (!retellInstance) {
    retellInstance = createRetellClient()
  }
  return retellInstance
}

export interface RetellSessionOptions {
  persona: Persona
  scenarioType: 'cold_call' | 'objection' | 'closing' | 'gatekeeper'
  onTranscript?: (entry: TranscriptEntry) => void
  onCallStart?: (callId: string) => void
  onCallEnd?: (transcript: TranscriptEntry[]) => void
  onError?: (error: Error) => void
}

// Retell update event types
interface RetellTranscriptWord {
  word: string
  start: number
  end: number
}

interface RetellTranscriptEntry {
  role: 'agent' | 'user'
  content: string
  words?: RetellTranscriptWord[]
}

interface RetellUpdateEvent {
  transcript?: RetellTranscriptEntry[]
  turntaking?: string
}

/**
 * Generate a simple hash for deduplication
 */
function hashEntry(role: string, content: string): string {
  return `${role}:${content.trim().toLowerCase()}`
}

export async function startRetellSession(options: RetellSessionOptions): Promise<string> {
  const { persona, scenarioType, onTranscript, onCallStart, onCallEnd, onError } = options

  if (!persona.retellAgentId) {
    throw new Error('Retell agent not configured for this persona')
  }

  // Reset state for new session
  seenTranscripts = new Set()
  currentTranscript = []

  // Create fresh client to ensure clean event handlers
  const retell = createRetellClient()

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
    // Pass the accumulated transcript on call end
    onCallEnd?.(currentTranscript)
  })

  retell.on('update', (update: RetellUpdateEvent) => {
    // Handle transcript updates
    // Note: Retell sends the last 5 sentences on each update
    if (update.transcript && update.transcript.length > 0) {
      for (const entry of update.transcript) {
        if (!entry.content || entry.content.trim() === '') continue

        const hash = hashEntry(entry.role, entry.content)

        // Skip if we've already seen this entry
        if (seenTranscripts.has(hash)) continue

        seenTranscripts.add(hash)

        const transcriptEntry: TranscriptEntry = {
          role: entry.role === 'agent' ? 'assistant' : 'user',
          content: entry.content.trim(),
          timestamp: Date.now(),
        }

        currentTranscript.push(transcriptEntry)
        onTranscript?.(transcriptEntry)
      }
    }
  })

  retell.on('error', (error: Error | { message?: string }) => {
    const errorMessage = error instanceof Error ? error.message : (error?.message || 'Retell error')
    onError?.(new Error(errorMessage))
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
  if (retellInstance) {
    retellInstance.stopCall()
  }
}

export function muteRetellSession(muted: boolean): void {
  if (!retellInstance) return

  if (muted) {
    retellInstance.mute()
  } else {
    retellInstance.unmute()
  }
}

/**
 * Get the current session's accumulated transcript
 */
export function getCurrentTranscript(): TranscriptEntry[] {
  return [...currentTranscript]
}
