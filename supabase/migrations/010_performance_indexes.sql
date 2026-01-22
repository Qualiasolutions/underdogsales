-- Performance optimization indexes
-- Created: 2026-01-21

-- Composite index for roleplay_sessions pagination queries
-- Optimizes: SELECT ... WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_user_created
  ON roleplay_sessions(user_id, created_at DESC);

-- Composite index for session_scores with soft delete filter
-- Optimizes RLS policy checks on session_scores
CREATE INDEX IF NOT EXISTS idx_session_scores_session_deleted
  ON session_scores(session_id)
  WHERE deleted_at IS NULL;

-- Composite index for call_uploads user queries with status
-- Optimizes: SELECT ... WHERE user_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_call_uploads_user_status_created
  ON call_uploads(user_id, status, created_at DESC);

-- Index for curriculum_progress lookups
CREATE INDEX IF NOT EXISTS idx_curriculum_progress_user_module
  ON curriculum_progress(user_id, module_id);

-- Analyze tables to update statistics after index creation
ANALYZE roleplay_sessions;
ANALYZE session_scores;
ANALYZE call_uploads;
ANALYZE curriculum_progress;
