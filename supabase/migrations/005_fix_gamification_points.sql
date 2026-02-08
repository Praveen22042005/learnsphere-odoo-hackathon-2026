-- Migration: Fix Gamification Points System
-- Description: Add missing columns to quiz_attempts and create default quiz rewards
-- Date: 2026-02-08

-- Add missing columns to quiz_attempts table
ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_learner_quiz ON quiz_attempts(learner_id, quiz_id);

-- Insert default quiz rewards for all existing quizzes (if not already present)
-- Points decrease with each attempt: 15, 10, 5, 2
INSERT INTO quiz_rewards (quiz_id, attempt_number, points_awarded)
SELECT DISTINCT q.id, 1, 15
FROM quizzes q
WHERE NOT EXISTS (
    SELECT 1 FROM quiz_rewards qr 
    WHERE qr.quiz_id = q.id AND qr.attempt_number = 1
)
ON CONFLICT (quiz_id, attempt_number) DO NOTHING;

INSERT INTO quiz_rewards (quiz_id, attempt_number, points_awarded)
SELECT DISTINCT q.id, 2, 10
FROM quizzes q
WHERE NOT EXISTS (
    SELECT 1 FROM quiz_rewards qr 
    WHERE qr.quiz_id = q.id AND qr.attempt_number = 2
)
ON CONFLICT (quiz_id, attempt_number) DO NOTHING;

INSERT INTO quiz_rewards (quiz_id, attempt_number, points_awarded)
SELECT DISTINCT q.id, 3, 5
FROM quizzes q
WHERE NOT EXISTS (
    SELECT 1 FROM quiz_rewards qr 
    WHERE qr.quiz_id = q.id AND qr.attempt_number = 3
)
ON CONFLICT (quiz_id, attempt_number) DO NOTHING;

INSERT INTO quiz_rewards (quiz_id, attempt_number, points_awarded)
SELECT DISTINCT q.id, 4, 2
FROM quizzes q
WHERE NOT EXISTS (
    SELECT 1 FROM quiz_rewards qr 
    WHERE qr.quiz_id = q.id AND qr.attempt_number = 4
)
ON CONFLICT (quiz_id, attempt_number) DO NOTHING;

-- Update existing quiz attempts to set points_earned based on rewards
-- This is a one-time backfill for historical data
UPDATE quiz_attempts qa
SET points_earned = COALESCE(qr.points_awarded, 0)
FROM quiz_rewards qr
WHERE qa.quiz_id = qr.quiz_id 
  AND qa.passed = true
  AND qa.points_earned = 0
  AND qr.attempt_number = COALESCE(qa.attempt_number, 1);

-- Recalculate learner profile points based on all passed quiz attempts
-- This ensures the points column is accurate
UPDATE learner_profiles lp
SET points = COALESCE((
    SELECT SUM(qa.points_earned)
    FROM quiz_attempts qa
    WHERE qa.learner_id = lp.user_id AND qa.passed = true
), 0);

COMMENT ON COLUMN quiz_attempts.points_earned IS 'Points earned for this quiz attempt';
COMMENT ON COLUMN quiz_attempts.attempt_number IS 'Attempt number for this quiz (1st, 2nd, 3rd, etc.)';
