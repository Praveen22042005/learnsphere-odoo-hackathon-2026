-- ============================================================================
-- LearnSphere Feature Enhancements Migration
-- Adds course_admin, lesson image/document types, quiz improvements
-- ============================================================================

-- Add course_admin (responsible person) to courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS course_admin_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add image lesson support
CREATE TYPE lesson_type_v2 AS ENUM ('video', 'text', 'quiz', 'assignment', 'document', 'image');

-- We cannot easily alter enums in Postgres, so we drop the constraint and use TEXT
-- The app layer validates the type
ALTER TABLE lessons ALTER COLUMN lesson_type TYPE TEXT;

-- Add start_date tracking to enrollments  
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Add time_spent_minutes to enrollments for total course time tracking
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0;

-- Make quizzes reference courses directly (not only through lessons)
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- Backfill course_id for existing quizzes
UPDATE quizzes q
SET course_id = l.course_id
FROM lessons l
WHERE q.lesson_id = l.id AND q.course_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);
