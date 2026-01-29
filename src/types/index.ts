// Core types for Underdog AI Sales Coach

// Call Upload Status Types
export type CallUploadStatus = 'pending' | 'transcribing' | 'scoring' | 'completed' | 'failed'

export interface Organization {
  id: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface User {
  id: string
  org_id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
}

export interface Persona {
  id: string
  name: string
  role: string
  personality: string
  objections: string[]
  warmth: number // 0-1 scale
  voiceId: string
  assistantId: string // VAPI assistant with pre-configured voice
  retellAgentId?: string // Retell agent ID for migration
}

export interface RoleplaySession {
  id: string
  user_id: string
  persona_id: string
  scenario_type: 'cold_call' | 'objection' | 'closing' | 'gatekeeper'
  duration_seconds: number
  vapi_call_id: string
  transcript: TranscriptEntry[]
  created_at: string
}

export interface TranscriptEntry {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface SessionScore {
  id: string
  session_id: string
  dimension: ScoreDimension
  score: number // 1-10
  feedback: string
  created_at: string
}

export type ScoreDimension =
  | 'opener'
  | 'pitch'
  | 'discovery'
  | 'objection_handling'
  | 'closing'
  | 'communication'

export interface CallUpload {
  id: string
  user_id: string
  file_path: string
  original_filename: string
  file_size_bytes: number
  duration_seconds: number
  status: CallUploadStatus
  error_message?: string
  transcript: TranscriptEntry[]
  analysis: CallAnalysis | null
  overall_score: number | null
  created_at: string
}

// Whisper API Response Types
export interface WhisperTranscriptSegment {
  id: number
  seek: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

export interface WhisperResponse {
  task: string
  language: string
  duration: number
  text: string
  segments: WhisperTranscriptSegment[]
}

export interface CallAnalysis {
  summary: string
  strengths: string[]
  improvements: string[]
  scores: Record<ScoreDimension, DimensionScore>
}

export interface DimensionScore {
  score: number
  feedback: string
  criteria: CriterionResult[]
}

export interface CriterionResult {
  name: string
  passed: boolean
  note?: string
}

export interface CurriculumModule {
  id: number
  name: string
  description: string
  topics: string[]
  content: string
}

export interface CurriculumProgress {
  id: string
  user_id: string
  module_id: number
  completed: boolean
  score?: number
  completed_at?: string
}

export interface Objection {
  id: string
  category: 'pricing' | 'status_quo' | 'brush_off' | 'timing' | 'authority'
  objection_text: string
  response_template: string
  psychology_principle?: string
}

// VAPI Types
export interface VapiSessionConfig {
  assistantId?: string
  assistant?: VapiAssistantConfig
}

export interface VapiAssistantConfig {
  name: string
  model: {
    provider: 'openai' | 'anthropic'
    model: string
    temperature: number
    systemPrompt: string
  }
  voice: {
    provider: '11labs' | 'deepgram'
    voiceId: string
  }
  analysisPlan?: {
    summaryPrompt: string
    structuredDataSchema: Record<string, unknown>
  }
}

export interface VapiCallEvent {
  type: 'call-start' | 'call-end' | 'speech-start' | 'speech-end' | 'transcript' | 'function-call'
  call?: {
    id: string
    status: string
  }
  role?: 'user' | 'assistant'
  transcript?: string
  transcriptType?: 'partial' | 'final'
  functionCall?: {
    name: string
    parameters: Record<string, unknown>
  }
}

// Scoring types
export interface ScoringRubric {
  dimension: ScoreDimension
  weight: number
  criteria: ScoringCriterion[]
}

export interface ScoringCriterion {
  name: string
  description: string
  weight: number
}

// Analytics types
export interface UserAnalytics {
  user_id: string
  total_sessions: number
  total_duration_minutes: number
  average_score: number
  scores_by_dimension: Record<ScoreDimension, number>
  improvement_trend: number // percentage change last 30 days
}

export interface TeamAnalytics {
  org_id: string
  total_users: number
  active_users_30d: number
  total_sessions: number
  average_team_score: number
  top_performers: { user_id: string; name: string; score: number }[]
}

// Leaderboard types
export type LeaderboardTrend = 'hot' | 'rising' | 'steady'

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_initial: string
  total_sessions: number
  avg_score: number
  best_score: number
  total_practice_minutes: number
  rank: number
  trend: LeaderboardTrend
  is_current_user?: boolean
}
