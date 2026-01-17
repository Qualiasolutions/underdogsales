import type { TranscriptEntry, WhisperResponse } from '@/types'

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions'

interface TranscribeOptions {
  audioBuffer: ArrayBuffer | Uint8Array
  filename: string
  contentType: string
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(options: TranscribeOptions): Promise<{
  transcript: TranscriptEntry[]
  durationSeconds: number
  fullText: string
}> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  // Create form data for the API request
  const formData = new FormData()
  // Create Blob from ArrayBuffer
  const blob = new Blob([options.audioBuffer as BlobPart], { type: options.contentType })
  formData.append('file', blob, options.filename)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'segment')

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI Whisper API error: ${response.status} - ${error}`)
  }

  const data: WhisperResponse = await response.json()

  // Convert Whisper segments to TranscriptEntry format
  // Since Whisper doesn't do speaker diarization, we'll use a simple heuristic:
  // Alternate between user (sales rep) and assistant (prospect) based on pauses
  const transcript = convertToTranscriptEntries(data.segments)
  const durationSeconds = Math.round(data.duration)

  return {
    transcript,
    durationSeconds,
    fullText: data.text,
  }
}

/**
 * Convert Whisper segments to TranscriptEntry format
 * Uses pause detection to estimate speaker changes
 */
function convertToTranscriptEntries(
  segments: WhisperResponse['segments']
): TranscriptEntry[] {
  if (!segments || segments.length === 0) {
    return []
  }

  const entries: TranscriptEntry[] = []
  let currentSpeaker: 'user' | 'assistant' = 'user' // Start with sales rep
  let lastEndTime = 0

  for (const segment of segments) {
    // Detect speaker change based on significant pause (> 1.5 seconds)
    // This is a heuristic since Whisper doesn't provide speaker diarization
    const pauseDuration = segment.start - lastEndTime
    if (pauseDuration > 1.5 && entries.length > 0) {
      currentSpeaker = currentSpeaker === 'user' ? 'assistant' : 'user'
    }

    entries.push({
      role: currentSpeaker,
      content: segment.text.trim(),
      timestamp: Math.round(segment.start * 1000), // Convert to milliseconds
    })

    lastEndTime = segment.end
  }

  // Merge consecutive segments from the same speaker
  return mergeConsecutiveSegments(entries)
}

/**
 * Merge consecutive segments from the same speaker
 */
function mergeConsecutiveSegments(entries: TranscriptEntry[]): TranscriptEntry[] {
  if (entries.length === 0) return []

  const merged: TranscriptEntry[] = []
  let current = { ...entries[0] }

  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i]
    if (entry.role === current.role) {
      // Same speaker, merge content
      current.content += ' ' + entry.content
    } else {
      // Different speaker, push current and start new
      merged.push(current)
      current = { ...entry }
    }
  }

  // Push the last segment
  merged.push(current)

  return merged
}

/**
 * Get the duration of an audio file (in seconds) without full transcription
 * Uses ffprobe if available, otherwise estimates from file size
 */
export async function getAudioDuration(): Promise<number | null> {
  // For now, return null and let the transcription provide the duration
  // A more accurate implementation would use ffprobe or a similar tool
  return null
}
