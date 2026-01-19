-- ===========================================
-- Migration: 004_audit_log
-- Description: Add audit logging for sensitive operations
-- ===========================================

-- Audit log table for tracking changes to sensitive data
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON audit_log(record_id);

-- RLS for audit log (admin only viewing)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON audit_log
  FOR INSERT WITH CHECK (true);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  audit_user_id UUID;
BEGIN
  -- Get the current user ID
  audit_user_id := auth.uid();

  -- Skip if this is a system operation (no user context)
  -- But still log the change
  INSERT INTO audit_log (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables

-- Audit call_uploads (contains sensitive user recordings)
DROP TRIGGER IF EXISTS audit_call_uploads ON call_uploads;
CREATE TRIGGER audit_call_uploads
  AFTER INSERT OR UPDATE OR DELETE ON call_uploads
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Audit roleplay_sessions (contains user practice data)
DROP TRIGGER IF EXISTS audit_roleplay_sessions ON roleplay_sessions;
CREATE TRIGGER audit_roleplay_sessions
  AFTER INSERT OR UPDATE OR DELETE ON roleplay_sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Audit session_scores (contains performance evaluations)
DROP TRIGGER IF EXISTS audit_session_scores ON session_scores;
CREATE TRIGGER audit_session_scores
  AFTER INSERT OR UPDATE OR DELETE ON session_scores
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Audit users table for profile changes
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
  AFTER UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Comment on table
COMMENT ON TABLE audit_log IS 'Audit trail for tracking changes to sensitive user data';
