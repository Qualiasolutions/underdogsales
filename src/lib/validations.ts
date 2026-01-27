import { z } from 'zod'

// ============================================
// Chat API Schemas
// ============================================

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
})

export const ChatRequestSchema = z.object({
  messages: z
    .array(ChatMessageSchema)
    .min(1, 'At least one message required')
    .max(50, 'Too many messages'),
  mode: z.enum(['pitch', 'objections', 'general']).optional(),
})

export type ChatRequest = z.infer<typeof ChatRequestSchema>

// ============================================
// Call Analysis Schemas
// ============================================

export const CallIdSchema = z
  .string()
  .uuid({ error: 'Invalid call ID format' })

// Supported audio content types
const AUDIO_CONTENT_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
] as const

export const UploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename characters'),
  contentType: z.enum(AUDIO_CONTENT_TYPES, { error: 'Unsupported audio format' }),
  fileSize: z
    .number()
    .min(1, 'File cannot be empty')
    .max(100 * 1024 * 1024, 'File too large (max 100MB)'),
})

export type UploadRequest = z.infer<typeof UploadRequestSchema>

export const TranscribeRequestSchema = z.object({
  callId: CallIdSchema,
})

export type TranscribeRequest = z.infer<typeof TranscribeRequestSchema>

export const ScoreRequestSchema = z.object({
  callId: CallIdSchema,
})

export type ScoreRequest = z.infer<typeof ScoreRequestSchema>

// ============================================
// Knowledge Search Schemas
// ============================================

export const KnowledgeSearchSchema = z.object({
  query: z
    .string()
    .min(2, 'Query too short')
    .max(500, 'Query too long'),
  source: z.enum(['wiki', 'persona', 'rubric', 'curriculum']).optional(),
  limit: z.number().min(1).max(20).default(5),
})

export type KnowledgeSearch = z.infer<typeof KnowledgeSearchSchema>

// ============================================
// Practice Session Schemas
// ============================================

export const PersonaIdSchema = z.enum([
  'skeptical_cfo',
  'busy_vp_sales',
  'friendly_gatekeeper',
  'defensive_manager',
  'interested_but_stuck',
  'aggressive_closer',
])

export const ScenarioTypeSchema = z.enum([
  'cold_call',
  'objection',
  'closing',
  'gatekeeper',
])

export const TranscriptEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
})

export const SaveSessionRequestSchema = z.object({
  personaId: PersonaIdSchema,
  scenarioType: ScenarioTypeSchema,
  transcript: z.array(TranscriptEntrySchema),
  durationSeconds: z.number().min(0).max(3600), // Max 1 hour
  vapiCallId: z.string().optional(),
})

export type SaveSessionRequest = z.infer<typeof SaveSessionRequestSchema>

// ============================================
// Validation Helper
// ============================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string>
}

/**
 * Safely parse and validate input with Zod schema
 * Returns typed result with user-friendly error messages
 */
export function validateInput<T>(
  schema: z.ZodType<T>,
  input: unknown
): ValidationResult<T> {
  const result = schema.safeParse(input)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Use Zod's built-in error formatting
  const errorMessage = result.error.message || 'Invalid input'

  return {
    success: false,
    error: errorMessage,
  }
}
