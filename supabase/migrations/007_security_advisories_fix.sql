-- ===========================================
-- Migration: 007_security_advisories_fix
-- Description: Fix Supabase security advisories
-- Issues addressed:
--   1. Function search_path mutable (3 functions)
--   2. RLS policy always true (audit_log INSERT)
-- Note: Vector extension in public schema is a known issue
--       but moving it would break existing columns. For new
--       projects, create extensions in 'extensions' schema.
-- ===========================================

-- ============================================
-- 1. Fix function search_path vulnerabilities
-- ============================================

-- Fix handle_new_user function
-- Using SET search_path = 'public' to prevent search path injection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix audit_trigger_func function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_user_id UUID;
BEGIN
  -- Get the current user ID
  audit_user_id := auth.uid();

  -- Insert audit record
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    operation,
    user_id,
    old_data,
    new_data
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    audit_user_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix soft_delete function
CREATE OR REPLACE FUNCTION public.soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Instead of deleting, set deleted_at timestamp
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix match_objections function (also needs search_path)
CREATE OR REPLACE FUNCTION public.match_objections(
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
SECURITY INVOKER
SET search_path = public
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
  FROM public.objection_library ol
  WHERE 1 - (ol.embedding <=> query_embedding) > match_threshold
  ORDER BY ol.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fix match_knowledge function (also needs search_path)
CREATE OR REPLACE FUNCTION public.match_knowledge(
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
SECURITY INVOKER
SET search_path = public
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
  FROM public.knowledge_base kb
  WHERE
    kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
    AND (filter_source IS NULL OR kb.source = filter_source)
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Fix update_knowledge_base_updated_at function
CREATE OR REPLACE FUNCTION public.update_knowledge_base_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. Fix audit_log RLS INSERT policy
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_log;

-- Create a more restrictive policy
-- This allows only service_role connections to insert directly
-- The audit_trigger_func uses SECURITY DEFINER and bypasses RLS
CREATE POLICY "Only service role can insert audit logs" ON public.audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add policy comment
COMMENT ON POLICY "Only service role can insert audit logs" ON public.audit_log IS
  'Restricts direct INSERT to service_role only. Audit triggers use SECURITY DEFINER functions which bypass RLS.';

-- ============================================
-- Note on remaining advisories:
-- ============================================
-- 1. Vector extension in public: Moving would break existing
--    columns. Accepted risk for existing project.
-- 2. Leaked password protection: Enable in Supabase Dashboard
--    under Authentication > Settings > Password Strength
