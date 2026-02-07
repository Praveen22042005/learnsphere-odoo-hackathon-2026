-- Add course_id column to quizzes table
-- This allows quizzes to be associated with either a course or a specific lesson

ALTER TABLE quizzes 
ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- Add index for course_id lookups
CREATE INDEX idx_quizzes_course ON quizzes(course_id);

-- Add constraint to ensure quiz is associated with either course or lesson
ALTER TABLE quizzes
ADD CONSTRAINT quizzes_course_or_lesson_check 
CHECK (course_id IS NOT NULL OR lesson_id IS NOT NULL);
