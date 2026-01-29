-- Add target_role to users table
-- This represents WHO the user sells to (their ICP target)

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS target_role TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.users.target_role IS 'The role/position the user sells to (e.g., VP of Sales, CTO, Head of Marketing)';

-- Optional: Add cached ICP context to avoid re-generating every session
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS icp_context JSONB;

COMMENT ON COLUMN public.users.icp_context IS 'Cached ICP context generated from company + target_role (pain points, value props, etc.)';
