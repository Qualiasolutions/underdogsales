-- ===========================================
-- Migration: 008_fix_performance_advisories
-- Description: Fix Supabase performance advisories
-- Issues addressed:
--   1. RLS policies using auth.uid() instead of (select auth.uid())
--   2. Multiple permissive policies on same tables
--   3. Drop unused indexes
-- ===========================================

-- ============================================
-- 1. Remove duplicate permissive policies
-- ============================================

-- call_uploads: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.call_uploads;

-- curriculum_progress: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view their own progress" ON public.curriculum_progress;

-- roleplay_sessions: Remove duplicate SELECT policy (keep the more comprehensive org one)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.roleplay_sessions;

-- session_scores: Remove duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view their session scores" ON public.session_scores;

-- ============================================
-- 2. Fix RLS policies to use (select auth.uid())
-- ============================================

-- Fix call_uploads "Users can update their own uploads"
DROP POLICY IF EXISTS "Users can update their own uploads" ON public.call_uploads;
CREATE POLICY "Users can update their own uploads" ON public.call_uploads
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- Fix audit_log "Admins can view audit logs"
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs" ON public.audit_log
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = (select auth.uid())
    AND users.role = 'admin'
  ));

-- Fix roleplay_sessions "Admins can view all sessions"
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.roleplay_sessions;
CREATE POLICY "Admins can view all sessions" ON public.roleplay_sessions
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = (select auth.uid())
    AND users.role = 'admin'
  ));

-- Fix call_uploads "Admins can view all uploads"
DROP POLICY IF EXISTS "Admins can view all uploads" ON public.call_uploads;
CREATE POLICY "Admins can view all uploads" ON public.call_uploads
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = (select auth.uid())
    AND users.role = 'admin'
  ));

-- ============================================
-- 3. Drop unused indexes (keeping essential ones)
-- ============================================

-- Drop unused audit_log indexes (table is auto-populated, rarely queried directly)
DROP INDEX IF EXISTS idx_audit_log_user;
DROP INDEX IF EXISTS idx_audit_log_table;
DROP INDEX IF EXISTS idx_audit_log_created;
DROP INDEX IF EXISTS idx_audit_log_record;

-- Drop unused soft-delete indexes (app is new, not heavily used yet)
DROP INDEX IF EXISTS idx_roleplay_sessions_deleted;
DROP INDEX IF EXISTS idx_call_uploads_deleted;
DROP INDEX IF EXISTS idx_session_scores_deleted;
DROP INDEX IF EXISTS idx_curriculum_progress_deleted;

-- Drop redundant knowledge_base indexes
DROP INDEX IF EXISTS idx_knowledge_base_source;
DROP INDEX IF EXISTS idx_knowledge_base_source_file;
DROP INDEX IF EXISTS idx_knowledge_base_topics;
DROP INDEX IF EXISTS idx_knowledge_base_created_at;
