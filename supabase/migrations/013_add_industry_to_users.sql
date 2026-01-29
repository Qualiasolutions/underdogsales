-- Add industry column to users table for roleplay context
-- This allows personas to adapt their roleplay based on user's selling industry

ALTER TABLE users ADD COLUMN IF NOT EXISTS industry TEXT;

-- Create check constraint for valid industries
ALTER TABLE users ADD CONSTRAINT users_industry_check
  CHECK (industry IS NULL OR industry IN (
    'saas_tech',
    'healthcare',
    'finance',
    'real_estate',
    'manufacturing',
    'professional_services'
  ));

COMMENT ON COLUMN users.industry IS 'User selling industry - affects roleplay persona context';
