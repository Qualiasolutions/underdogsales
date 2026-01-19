-- ===========================================
-- Migration: 005_soft_delete
-- Description: Add soft delete support for data retention
-- ===========================================

-- Add soft delete columns to tables with user data

-- roleplay_sessions
ALTER TABLE roleplay_sessions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_deleted
  ON roleplay_sessions(deleted_at)
  WHERE deleted_at IS NULL;

-- call_uploads
ALTER TABLE call_uploads
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_call_uploads_deleted
  ON call_uploads(deleted_at)
  WHERE deleted_at IS NULL;

-- session_scores
ALTER TABLE session_scores
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_session_scores_deleted
  ON session_scores(deleted_at)
  WHERE deleted_at IS NULL;

-- curriculum_progress
ALTER TABLE curriculum_progress
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_curriculum_progress_deleted
  ON curriculum_progress(deleted_at)
  WHERE deleted_at IS NULL;

-- Update RLS policies to exclude soft-deleted records

-- roleplay_sessions: Update select policy
DROP POLICY IF EXISTS "Users can view their own sessions" ON roleplay_sessions;
CREATE POLICY "Users can view their own sessions" ON roleplay_sessions
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- call_uploads: Update select policy
DROP POLICY IF EXISTS "Users can view their own uploads" ON call_uploads;
CREATE POLICY "Users can view their own uploads" ON call_uploads
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- session_scores: Update select policy
DROP POLICY IF EXISTS "Users can view their session scores" ON session_scores;
CREATE POLICY "Users can view their session scores" ON session_scores
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM roleplay_sessions rs
      WHERE rs.id = session_scores.session_id
        AND rs.user_id = auth.uid()
        AND rs.deleted_at IS NULL
    )
  );

-- curriculum_progress: Update select policy
DROP POLICY IF EXISTS "Users can view their own progress" ON curriculum_progress;
CREATE POLICY "Users can view their own progress" ON curriculum_progress
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Soft delete function (use instead of hard delete)
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of deleting, set deleted_at timestamp
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin policy to view all records including deleted (for compliance)
CREATE POLICY "Admins can view all sessions" ON roleplay_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all uploads" ON call_uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Comments
COMMENT ON COLUMN roleplay_sessions.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN call_uploads.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN session_scores.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN curriculum_progress.deleted_at IS 'Soft delete timestamp - NULL means active';
