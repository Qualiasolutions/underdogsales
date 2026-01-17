-- Migration: 003_call_uploads_status
-- Purpose: Add status tracking and error handling to call_uploads table
-- Applied: 2026-01-17

-- Add status column with enum check
ALTER TABLE call_uploads
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
  CHECK (status IN ('pending', 'transcribing', 'scoring', 'completed', 'failed'));

-- Add error_message column for failure tracking
ALTER TABLE call_uploads
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add original_filename for UI display
ALTER TABLE call_uploads
ADD COLUMN IF NOT EXISTS original_filename TEXT;

-- Add index for status filtering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_call_uploads_status ON call_uploads(status);

-- Add index for user + status (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_call_uploads_user_status ON call_uploads(user_id, status);

-- Update RLS policy to allow users to update their own uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'call_uploads'
    AND policyname = 'Users can update their own uploads'
  ) THEN
    CREATE POLICY "Users can update their own uploads" ON call_uploads
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create storage bucket for call recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'call-recordings',
  'call-recordings',
  false,
  104857600,  -- 100MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4', 'audio/x-m4a', 'audio/x-wav']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload their own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'call-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read their own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'call-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'call-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
