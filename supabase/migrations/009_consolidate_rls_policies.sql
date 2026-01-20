-- ===========================================
-- Migration: 009_consolidate_rls_policies
-- Description: Consolidate multiple permissive policies into single ones
-- ===========================================

-- ============================================
-- 1. call_uploads - Combine user + admin SELECT
-- ============================================
DROP POLICY IF EXISTS "Users can view own uploads" ON public.call_uploads;
DROP POLICY IF EXISTS "Admins can view all uploads" ON public.call_uploads;

CREATE POLICY "Users can view uploads" ON public.call_uploads
  FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );

-- ============================================
-- 2. roleplay_sessions - Combine all SELECT into one
-- ============================================
DROP POLICY IF EXISTS "Users can view own or org sessions" ON public.roleplay_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.roleplay_sessions;

CREATE POLICY "Users can view sessions" ON public.roleplay_sessions
  FOR SELECT
  USING (
    -- Own sessions
    user_id = (select auth.uid())
    -- Or org sessions for admins
    OR user_id IN (
      SELECT u.id FROM users u
      WHERE u.org_id IN (
        SELECT u2.org_id FROM users u2
        WHERE u2.id = (select auth.uid())
        AND u2.role = 'admin'
      )
    )
    -- Or all sessions for admins
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'admin'
    )
  );
