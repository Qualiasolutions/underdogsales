export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_uploads: {
        Row: {
          analysis: Json | null
          created_at: string | null
          deleted_at: string | null
          duration_seconds: number | null
          error_message: string | null
          file_path: string
          file_size_bytes: number | null
          id: string
          original_filename: string | null
          overall_score: number | null
          status: string | null
          transcript: Json | null
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_path: string
          file_size_bytes?: number | null
          id?: string
          original_filename?: string | null
          overall_score?: number | null
          status?: string | null
          transcript?: Json | null
          user_id: string
        }
        Update: {
          analysis?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          original_filename?: string | null
          overall_score?: number | null
          status?: string | null
          transcript?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_modules: {
        Row: {
          content: Json | null
          created_at: string | null
          description: string | null
          id: number
          name: string
          order_index: number
          topics: string[] | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          order_index: number
          topics?: string[] | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          order_index?: number
          topics?: string[] | null
        }
        Relationships: []
      }
      curriculum_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          deleted_at: string | null
          id: string
          module_id: number
          score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          deleted_at?: string | null
          id?: string
          module_id: number
          score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          deleted_at?: string | null
          id?: string
          module_id?: number
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          section_title: string
          source: string
          source_file: string
          topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          section_title: string
          source: string
          source_file: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          section_title?: string
          source?: string
          source_file?: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      objection_library: {
        Row: {
          category: string
          created_at: string | null
          embedding: string | null
          id: string
          objection_text: string
          psychology_principle: string | null
          response_template: string
        }
        Insert: {
          category: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          objection_text: string
          psychology_principle?: string | null
          response_template: string
        }
        Update: {
          category?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          objection_text?: string
          psychology_principle?: string | null
          response_template?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
        }
        Relationships: []
      }
      roleplay_sessions: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          duration_seconds: number | null
          id: string
          persona_id: string
          scenario_type: string
          transcript: Json | null
          user_id: string
          vapi_call_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          id?: string
          persona_id: string
          scenario_type: string
          transcript?: Json | null
          user_id: string
          vapi_call_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          id?: string
          persona_id?: string
          scenario_type?: string
          transcript?: Json | null
          user_id?: string
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roleplay_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      session_events: {
        Row: {
          created_at: string | null
          data: Json
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          event_type: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      session_scores: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          dimension: string
          feedback: string | null
          id: string
          score: number
          session_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          dimension: string
          feedback?: string | null
          id?: string
          score: number
          session_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          dimension?: string
          feedback?: string | null
          id?: string
          score?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          industry: string | null
          job_title: string | null
          name: string
          org_id: string | null
          role: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          industry?: string | null
          job_title?: string | null
          name: string
          org_id?: string | null
          role?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          industry?: string | null
          job_title?: string | null
          name?: string
          org_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hybrid_search_knowledge: {
        Args: {
          query_text: string
          query_embedding: string
          match_count?: number
          filter_source?: string | null
          rrf_k?: number
        }
        Returns: {
          id: string
          source: string
          source_file: string
          section_title: string
          content: string
          topics: string[]
          rrf_score: number
        }[]
      }
      match_knowledge: {
        Args: {
          filter_source?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          section_title: string
          similarity: number
          source: string
          source_file: string
          topics: string[]
        }[]
      }
      match_objections: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          category: string
          id: string
          objection_text: string
          psychology_principle: string
          response_template: string
          similarity: number
        }[]
      }
      search_knowledge_text: {
        Args: {
          search_query: string
          match_count?: number
          filter_source?: string | null
        }
        Returns: {
          id: string
          source: string
          source_file: string
          section_title: string
          content: string
          topics: string[]
          rank: number
        }[]
      }
      get_leaderboard: {
        Args: {
          result_limit?: number
          time_period?: string
        }
        Returns: {
          user_id: string
          display_name: string
          avatar_initial: string
          total_sessions: number
          avg_score: number
          best_score: number
          total_practice_minutes: number
          rank: number
          trend: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
