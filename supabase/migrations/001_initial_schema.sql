-- Underdog AI Sales Coach - Initial Schema
-- Migration: 001_initial_schema

-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roleplay sessions table
CREATE TABLE roleplay_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('cold_call', 'objection', 'closing', 'gatekeeper')),
  duration_seconds INTEGER,
  vapi_call_id TEXT,
  transcript JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session scores table
CREATE TABLE session_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES roleplay_sessions(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('opener', 'pitch', 'discovery', 'objection_handling', 'closing', 'communication')),
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call uploads table (for analyzing uploaded recordings)
CREATE TABLE call_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  duration_seconds INTEGER,
  transcript JSONB,
  analysis JSONB,
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curriculum progress table
CREATE TABLE curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL CHECK (module_id BETWEEN 1 AND 12),
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER CHECK (score BETWEEN 1 AND 10),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- Objection library table (for RAG)
CREATE TABLE objection_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('pricing', 'status_quo', 'brush_off', 'timing', 'authority')),
  objection_text TEXT NOT NULL,
  response_template TEXT NOT NULL,
  psychology_principle TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_roleplay_sessions_user_id ON roleplay_sessions(user_id);
CREATE INDEX idx_roleplay_sessions_created_at ON roleplay_sessions(created_at DESC);
CREATE INDEX idx_session_scores_session_id ON session_scores(session_id);
CREATE INDEX idx_call_uploads_user_id ON call_uploads(user_id);
CREATE INDEX idx_curriculum_progress_user_id ON curriculum_progress(user_id);
CREATE INDEX idx_objection_library_category ON objection_library(category);

-- Create vector index for objection similarity search
CREATE INDEX ON objection_library USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roleplay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE objection_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for roleplay_sessions
CREATE POLICY "Users can view their own sessions" ON roleplay_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON roleplay_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for session_scores
CREATE POLICY "Users can view scores for their sessions" ON session_scores
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM roleplay_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scores for their sessions" ON session_scores
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM roleplay_sessions WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for call_uploads
CREATE POLICY "Users can view their own uploads" ON call_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" ON call_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for curriculum_progress
CREATE POLICY "Users can view their own progress" ON curriculum_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON curriculum_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON curriculum_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for objection_library (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view objections" ON objection_library
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_objections(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  category text,
  objection_text text,
  response_template text,
  psychology_principle text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ol.id,
    ol.category,
    ol.objection_text,
    ol.response_template,
    ol.psychology_principle,
    1 - (ol.embedding <=> query_embedding) AS similarity
  FROM objection_library ol
  WHERE 1 - (ol.embedding <=> query_embedding) > match_threshold
  ORDER BY ol.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Admin policies (for org admins)
CREATE POLICY "Admins can view org users" ON users
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view org sessions" ON roleplay_sessions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE org_id IN (
        SELECT org_id FROM users WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );
