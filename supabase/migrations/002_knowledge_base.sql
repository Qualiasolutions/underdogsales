-- Underdog AI Sales Coach - Knowledge Base Schema
-- Migration: 002_knowledge_base
-- Purpose: RAG-enabled knowledge base for Underdog methodology content

-- Knowledge base table for storing chunked content with embeddings
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('wiki', 'persona', 'rubric', 'curriculum')),
  source_file TEXT NOT NULL,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_knowledge_base_source ON knowledge_base(source);
CREATE INDEX idx_knowledge_base_source_file ON knowledge_base(source_file);
CREATE INDEX idx_knowledge_base_topics ON knowledge_base USING GIN(topics);
CREATE INDEX idx_knowledge_base_created_at ON knowledge_base(created_at DESC);

-- Vector index for fast cosine similarity search
CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_base (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view knowledge" ON knowledge_base
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert/update (for ingestion scripts)
CREATE POLICY "Service role can manage knowledge" ON knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

-- Function for vector similarity search on knowledge base
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_source text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source text,
  source_file text,
  section_title text,
  content text,
  topics text[],
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.source,
    kb.source_file,
    kb.section_title,
    kb.content,
    kb.topics,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE
    kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
    AND (filter_source IS NULL OR kb.source = filter_source)
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();

-- Add comment for documentation
COMMENT ON TABLE knowledge_base IS 'RAG-enabled knowledge base containing chunked Underdog methodology content';
COMMENT ON COLUMN knowledge_base.source IS 'Content source: wiki, persona, rubric, or curriculum';
COMMENT ON COLUMN knowledge_base.topics IS 'Array of topic tags for filtering';
COMMENT ON COLUMN knowledge_base.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON FUNCTION match_knowledge IS 'Vector similarity search for knowledge base with optional source filtering';
