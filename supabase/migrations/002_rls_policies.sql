-- Row Level Security (RLS) Policies for LearnSphere
-- These policies ensure users can only access data they're authorized to see

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view all active users (for display purposes)
CREATE POLICY "Users can view all active users"
    ON users FOR SELECT
    USING (is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (clerk_user_id = auth.jwt() ->> 'sub');

-- ============================================================================
-- LEARNER PROFILES POLICIES
-- ============================================================================

-- Learners can view all learner profiles (for leaderboards)
CREATE POLICY "Learners can view all profiles"
    ON learner_profiles FOR SELECT
    USING (true);

-- Learners can only update their own profile
CREATE POLICY "Learners can update own profile"
    ON learner_profiles FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- INSTRUCTOR PROFILES POLICIES
-- ============================================================================

-- Anyone can view instructor profiles
CREATE POLICY "Anyone can view instructor profiles"
    ON instructor_profiles FOR SELECT
    USING (true);

-- Instructors can update their own profile
CREATE POLICY "Instructors can update own profile"
    ON instructor_profiles FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- ADMIN PROFILES POLICIES
-- ============================================================================

-- Only admins can view admin profiles
CREATE POLICY "Admins can view admin profiles"
    ON admin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );

-- Admins can update their own profile
CREATE POLICY "Admins can update own profile"
    ON admin_profiles FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
    ON courses FOR SELECT
    USING (status = 'published' OR instructor_id IN (
        SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

-- Instructors can create courses
CREATE POLICY "Instructors can create courses"
    ON courses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role IN ('instructor', 'admin')
        )
    );

-- Instructors can update their own courses
CREATE POLICY "Instructors can update own courses"
    ON courses FOR UPDATE
    USING (
        instructor_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Instructors and admins can delete courses
CREATE POLICY "Instructors can delete own courses"
    ON courses FOR DELETE
    USING (
        instructor_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        ) OR EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- LESSONS POLICIES
-- ============================================================================

-- Users can view lessons from published courses or courses they're enrolled in
CREATE POLICY "Users can view accessible lessons"
    ON lessons FOR SELECT
    USING (
        course_id IN (
            SELECT id FROM courses WHERE status = 'published'
        ) OR 
        course_id IN (
            SELECT course_id FROM enrollments 
            WHERE learner_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        ) OR
        course_id IN (
            SELECT id FROM courses 
            WHERE instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Instructors can manage lessons in their courses
CREATE POLICY "Instructors can manage own course lessons"
    ON lessons FOR ALL
    USING (
        course_id IN (
            SELECT id FROM courses 
            WHERE instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================

-- Learners can view their own enrollments
CREATE POLICY "Learners can view own enrollments"
    ON enrollments FOR SELECT
    USING (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        ) OR EXISTS (
            SELECT 1 FROM courses c
            WHERE c.id = enrollments.course_id 
            AND c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Learners can enroll themselves
CREATE POLICY "Learners can enroll in courses"
    ON enrollments FOR INSERT
    WITH CHECK (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Learners can update their own enrollment status
CREATE POLICY "Learners can update own enrollments"
    ON enrollments FOR UPDATE
    USING (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- LESSON PROGRESS POLICIES
-- ============================================================================

-- Users can view progress for their own enrollments or courses they teach
CREATE POLICY "Users can view relevant progress"
    ON lesson_progress FOR SELECT
    USING (
        enrollment_id IN (
            SELECT id FROM enrollments 
            WHERE learner_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        ) OR enrollment_id IN (
            SELECT e.id FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Learners can track their own progress
CREATE POLICY "Learners can manage own progress"
    ON lesson_progress FOR ALL
    USING (
        enrollment_id IN (
            SELECT id FROM enrollments 
            WHERE learner_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- ============================================================================
-- QUIZZES & QUESTIONS POLICIES
-- ============================================================================

-- Users can view quizzes for accessible lessons
CREATE POLICY "Users can view accessible quizzes"
    ON quizzes FOR SELECT
    USING (
        lesson_id IN (
            SELECT id FROM lessons l
            WHERE l.course_id IN (
                SELECT id FROM courses WHERE status = 'published'
            ) OR l.course_id IN (
                SELECT course_id FROM enrollments 
                WHERE learner_id IN (
                    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
                )
            )
        )
    );

-- Instructors can manage quizzes in their courses
CREATE POLICY "Instructors can manage own course quizzes"
    ON quizzes FOR ALL
    USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Similar policies for quiz_questions
CREATE POLICY "Users can view accessible questions"
    ON quiz_questions FOR SELECT
    USING (
        quiz_id IN (SELECT id FROM quizzes)
    );

CREATE POLICY "Instructors can manage own quiz questions"
    ON quiz_questions FOR ALL
    USING (
        quiz_id IN (
            SELECT q.id FROM quizzes q
            JOIN lessons l ON q.lesson_id = l.id
            JOIN courses c ON l.course_id = c.id
            WHERE c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- ============================================================================
-- QUIZ ATTEMPTS POLICIES
-- ============================================================================

-- Learners can view their own attempts
CREATE POLICY "Learners can view own attempts"
    ON quiz_attempts FOR SELECT
    USING (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        ) OR EXISTS (
            SELECT 1 FROM quizzes q
            JOIN lessons l ON q.lesson_id = l.id
            JOIN courses c ON l.course_id = c.id
            WHERE q.id = quiz_attempts.quiz_id
            AND c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Learners can create their own attempts
CREATE POLICY "Learners can create quiz attempts"
    ON quiz_attempts FOR INSERT
    WITH CHECK (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Anyone can view published reviews
CREATE POLICY "Anyone can view published reviews"
    ON reviews FOR SELECT
    USING (is_published = true OR learner_id IN (
        SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

-- Enrolled learners can create reviews
CREATE POLICY "Enrolled learners can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        ) AND course_id IN (
            SELECT course_id FROM enrollments 
            WHERE learner_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Learners can update their own reviews
CREATE POLICY "Learners can update own reviews"
    ON reviews FOR UPDATE
    USING (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- GAMIFICATION POLICIES
-- ============================================================================

-- Anyone can view badges and achievements
CREATE POLICY "Anyone can view badges"
    ON badges FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view achievements"
    ON achievements FOR SELECT
    USING (true);

-- Users can view all earned badges (for leaderboards)
CREATE POLICY "Anyone can view user badges"
    ON user_badges FOR SELECT
    USING (true);

-- Users can view all user achievements
CREATE POLICY "Anyone can view user achievements"
    ON user_achievements FOR SELECT
    USING (true);

-- Users can update their own achievement progress
CREATE POLICY "Users can update own achievements"
    ON user_achievements FOR UPDATE
    USING (
        learner_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- ============================================================================
-- LESSON ATTACHMENTS POLICIES
-- ============================================================================

ALTER TABLE lesson_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for accessible lessons
CREATE POLICY "Users can view accessible lesson attachments"
    ON lesson_attachments FOR SELECT
    USING (
        lesson_id IN (
            SELECT id FROM lessons l
            WHERE l.course_id IN (
                SELECT id FROM courses WHERE status = 'published'
            ) OR l.course_id IN (
                SELECT course_id FROM enrollments 
                WHERE learner_id IN (
                    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
                )
            ) OR l.course_id IN (
                SELECT id FROM courses 
                WHERE instructor_id IN (
                    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
                )
            )
        )
    );

-- Instructors can manage attachments in their course lessons
CREATE POLICY "Instructors can manage own course lesson attachments"
    ON lesson_attachments FOR ALL
    USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- ============================================================================
-- QUIZ REWARDS POLICIES
-- ============================================================================

ALTER TABLE quiz_rewards ENABLE ROW LEVEL SECURITY;

-- Anyone can view quiz rewards (transparent point system)
CREATE POLICY "Anyone can view quiz rewards"
    ON quiz_rewards FOR SELECT
    USING (true);

-- Instructors can manage rewards for their course quizzes
CREATE POLICY "Instructors can manage own quiz rewards"
    ON quiz_rewards FOR ALL
    USING (
        quiz_id IN (
            SELECT q.id FROM quizzes q
            JOIN lessons l ON q.lesson_id = l.id
            JOIN courses c ON l.course_id = c.id
            WHERE c.instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- ============================================================================
-- COURSE INVITATIONS POLICIES
-- ============================================================================

ALTER TABLE course_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations for their courses
CREATE POLICY "Instructors can view own course invitations"
    ON course_invitations FOR SELECT
    USING (
        course_id IN (
            SELECT id FROM courses 
            WHERE instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Instructors can create invitations for their courses
CREATE POLICY "Instructors can create course invitations"
    ON course_invitations FOR INSERT
    WITH CHECK (
        course_id IN (
            SELECT id FROM courses 
            WHERE instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Instructors can update invitations for their courses
CREATE POLICY "Instructors can update own course invitations"
    ON course_invitations FOR UPDATE
    USING (
        course_id IN (
            SELECT id FROM courses 
            WHERE instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );

-- Instructors can delete invitations for their courses
CREATE POLICY "Instructors can delete own course invitations"
    ON course_invitations FOR DELETE
    USING (
        course_id IN (
            SELECT id FROM courses 
            WHERE instructor_id IN (
                SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
            )
        )
    );
