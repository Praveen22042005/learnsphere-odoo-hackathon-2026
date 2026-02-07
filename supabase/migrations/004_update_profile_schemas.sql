-- Migration: Update Profile Schemas
-- Description: Add missing fields to learner_profiles and instructor_profiles tables
-- Date: 2026-02-07

-- Add preferred_language and learning_goals to learner_profiles
ALTER TABLE learner_profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS learning_goals TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN learner_profiles.preferred_language IS 'User preferred language for course content (default: en)';
COMMENT ON COLUMN learner_profiles.learning_goals IS 'Array of learning goals set by the learner';

-- Update the updated_at timestamp trigger to include new columns
-- (Already exists from initial migration, no changes needed)
