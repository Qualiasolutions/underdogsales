export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          plan: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          plan?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          org_id: string | null
          email: string
          name: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          email: string
          name: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          email?: string
          name?: string
          role?: string
          created_at?: string
        }
      }
      roleplay_sessions: {
        Row: {
          id: string
          user_id: string
          persona_id: string
          scenario_type: string
          duration_seconds: number | null
          vapi_call_id: string | null
          transcript: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          persona_id: string
          scenario_type: string
          duration_seconds?: number | null
          vapi_call_id?: string | null
          transcript?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          persona_id?: string
          scenario_type?: string
          duration_seconds?: number | null
          vapi_call_id?: string | null
          transcript?: Json | null
          created_at?: string
        }
      }
      session_scores: {
        Row: {
          id: string
          session_id: string
          dimension: string
          score: number
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          dimension: string
          score: number
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          dimension?: string
          score?: number
          feedback?: string | null
          created_at?: string
        }
      }
      call_uploads: {
        Row: {
          id: string
          user_id: string
          file_path: string
          file_size_bytes: number | null
          duration_seconds: number | null
          transcript: Json | null
          analysis: Json | null
          overall_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          file_size_bytes?: number | null
          duration_seconds?: number | null
          transcript?: Json | null
          analysis?: Json | null
          overall_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          file_size_bytes?: number | null
          duration_seconds?: number | null
          transcript?: Json | null
          analysis?: Json | null
          overall_score?: number | null
          created_at?: string
        }
      }
      curriculum_progress: {
        Row: {
          id: string
          user_id: string
          module_id: number
          completed: boolean
          score: number | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          module_id: number
          completed?: boolean
          score?: number | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: number
          completed?: boolean
          score?: number | null
          completed_at?: string | null
        }
      }
      objection_library: {
        Row: {
          id: string
          category: string
          objection_text: string
          response_template: string
          psychology_principle: string | null
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          objection_text: string
          response_template: string
          psychology_principle?: string | null
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          objection_text?: string
          response_template?: string
          psychology_principle?: string | null
          embedding?: number[] | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_objections: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          category: string
          objection_text: string
          response_template: string
          psychology_principle: string | null
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
