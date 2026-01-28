/**
 * Retell Web Client Library
 * Session-scoped state management to prevent memory leaks
 *
 * Note: Retell sends streaming partial transcripts. The transcript array
 * contains completed utterances + the current in-progress utterance.
 * We only show completed utterances (all except the last) to avoid duplicates.
 */

import { RetellWebClient } from 'retell-client-js-sdk'
import type { Persona, TranscriptEntry } from '@/types'

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
 * RetellSession encapsulates all state for a single voice call session.
 * This prevents memory leaks by ensuring all state is cleaned up when the session ends.
 */
class RetellSession {
  private client: RetellWebClient
  private completedUtterances = new Set<string>()
  private transcript: TranscriptEntry[] = []
  private lastSpeaker: 'agent' | 'user' | null = null
  private callId: string | null = null
  private isDestroyed = false

  // Store bound event handlers for proper cleanup
  private handlers: {
    onCallStarted?: () => void
    onCallEnded?: () => void
    onUpdate?: (update: RetellUpdateEvent) => void
    onError?: (error: Error | { message?: string }) => void
  } = {}

  constructor(private options: RetellSessionOptions) {
    this.client = new RetellWebClient()
  }

  /**
   * Generate a simple hash for deduplication
   */
  private hashEntry(role: string, content: string): string {
    return `${role}:${content.trim().toLowerCase()}`
  }

  /**
   * Start the voice session
   */
  async start(): Promise<string> {
    if (this.isDestroyed) {
      throw new Error('Cannot start a destroyed session')
    }

    const { persona, scenarioType, onTranscript, onCallStart, onCallEnd, onError } = this.options

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
    this.callId = callId

    // Set up event handlers (store references for cleanup)
    this.handlers.onCallStarted = () => {
      onCallStart?.(callId)
    }

    this.handlers.onCallEnded = () => {
      // Pass the accumulated transcript on call end
      onCallEnd?.(this.transcript)
      // Auto-cleanup when call ends
      this.destroy()
    }

    this.handlers.onUpdate = (update: RetellUpdateEvent) => {
      if (this.isDestroyed) return

      // Handle transcript updates
      if (update.transcript && update.transcript.length > 0) {
        // Process all entries EXCEPT the last one (which is still in progress)
        const completedEntries = update.transcript.slice(0, -1)

        for (const entry of completedEntries) {
          if (!entry.content || entry.content.trim() === '') continue

          const hash = this.hashEntry(entry.role, entry.content)

          // Skip if we've already shown this completed utterance
          if (this.completedUtterances.has(hash)) continue

          this.completedUtterances.add(hash)

          const transcriptEntry: TranscriptEntry = {
            role: entry.role === 'agent' ? 'assistant' : 'user',
            content: entry.content.trim(),
            timestamp: Date.now(),
          }

          this.transcript.push(transcriptEntry)
          onTranscript?.(transcriptEntry)
        }

        // Track speaker changes
        const lastEntry = update.transcript[update.transcript.length - 1]
        if (lastEntry) {
          this.lastSpeaker = lastEntry.role
        }
      }
    }

    this.handlers.onError = (error: Error | { message?: string }) => {
      const errorMessage = error instanceof Error ? error.message : (error?.message || 'Retell error')
      onError?.(new Error(errorMessage))
    }

    // Register event handlers
    this.client.on('call_started', this.handlers.onCallStarted)
    this.client.on('call_ended', this.handlers.onCallEnded)
    this.client.on('update', this.handlers.onUpdate)
    this.client.on('error', this.handlers.onError)

    // Start the call
    await this.client.startCall({
      accessToken,
      sampleRate: 24000,
      captureDeviceId: 'default',
    })

    return callId
  }

  /**
   * Stop the voice session
   */
  stop(): void {
    if (!this.isDestroyed) {
      this.client.stopCall()
    }
  }

  /**
   * Mute/unmute the microphone
   */
  setMuted(muted: boolean): void {
    if (this.isDestroyed) return

    if (muted) {
      this.client.mute()
    } else {
      this.client.unmute()
    }
  }

  /**
   * Get the current accumulated transcript
   */
  getTranscript(): TranscriptEntry[] {
    return [...this.transcript]
  }

  /**
   * Get the call ID
   */
  getCallId(): string | null {
    return this.callId
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    if (this.isDestroyed) return
    this.isDestroyed = true

    // Remove event handlers
    if (this.handlers.onCallStarted) {
      this.client.off('call_started', this.handlers.onCallStarted)
    }
    if (this.handlers.onCallEnded) {
      this.client.off('call_ended', this.handlers.onCallEnded)
    }
    if (this.handlers.onUpdate) {
      this.client.off('update', this.handlers.onUpdate)
    }
    if (this.handlers.onError) {
      this.client.off('error', this.handlers.onError)
    }

    // Clear all state
    this.handlers = {}
    this.completedUtterances.clear()
    this.transcript = []
    this.lastSpeaker = null
    this.callId = null
  }

  /**
   * Check if session is destroyed
   */
  isSessionDestroyed(): boolean {
    return this.isDestroyed
  }
}

// Track the active session (only one at a time)
let activeSession: RetellSession | null = null

/**
 * Create and start a new Retell session
 * Automatically destroys any existing session
 */
export async function startRetellSession(options: RetellSessionOptions): Promise<string> {
  // Clean up any existing session
  if (activeSession) {
    activeSession.destroy()
    activeSession = null
  }

  // Create new session
  activeSession = new RetellSession(options)
  return activeSession.start()
}

/**
 * Stop the current Retell session
 */
export function stopRetellSession(): void {
  if (activeSession) {
    activeSession.stop()
    // Don't destroy here - the call_ended handler will do it
  }
}

/**
 * Mute/unmute the current session
 */
export function muteRetellSession(muted: boolean): void {
  activeSession?.setMuted(muted)
}

/**
 * Get the current session's accumulated transcript
 */
export function getCurrentTranscript(): TranscriptEntry[] {
  return activeSession?.getTranscript() ?? []
}

/**
 * Get the active session (for advanced usage)
 */
export function getActiveSession(): RetellSession | null {
  return activeSession
}

/**
 * Explicitly destroy the active session
 */
export function destroyRetellSession(): void {
  if (activeSession) {
    activeSession.destroy()
    activeSession = null
  }
}
