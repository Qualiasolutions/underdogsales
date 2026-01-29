-- Custom Personas - User-generated roleplay characters
-- Migration: 012_custom_personas

-- Custom personas table
CREATE TABLE custom_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Persona identity
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  industry TEXT,

  -- Persona behavior
  personality TEXT NOT NULL,
  background TEXT,
  pain_points TEXT[],
  objections TEXT[],
  warmth DECIMAL(2,1) DEFAULT 0.3 CHECK (warmth BETWEEN 0 AND 1),

  -- ICP context that generated this persona
  icp_context JSONB, -- { industry, company_size, decision_maker_title, pain_points, etc. }

  -- Retell agent
  retell_agent_id TEXT,
  voice_id TEXT DEFAULT '11labs-Adrian',

  -- System prompt for the AI persona
  system_prompt TEXT NOT NULL,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_custom_personas_user_id ON custom_personas(user_id);
CREATE INDEX idx_custom_personas_active ON custom_personas(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_custom_personas_created_at ON custom_personas(created_at DESC);

-- RLS
ALTER TABLE custom_personas ENABLE ROW LEVEL SECURITY;

-- Users can only access their own personas
CREATE POLICY "Users can view their own personas" ON custom_personas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personas" ON custom_personas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas" ON custom_personas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas" ON custom_personas
  FOR DELETE USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_custom_persona_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_personas_updated_at
  BEFORE UPDATE ON custom_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_persona_timestamp();

-- Increment usage count function
CREATE OR REPLACE FUNCTION increment_persona_usage(persona_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE custom_personas
  SET usage_count = usage_count + 1
  WHERE id = persona_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow roleplay_sessions to reference custom personas
ALTER TABLE roleplay_sessions
  ADD COLUMN custom_persona_id UUID REFERENCES custom_personas(id) ON DELETE SET NULL;

CREATE INDEX idx_roleplay_sessions_custom_persona ON roleplay_sessions(custom_persona_id);
