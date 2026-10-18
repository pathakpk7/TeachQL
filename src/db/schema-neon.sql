-- =========================================================================
-- TeachQL Complete Database Schema for Neon PostgreSQL
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('TEACHER', 'STUDENT', 'ADMIN')),
    roll_number TEXT,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    academic_year INT NOT NULL DEFAULT 1,
    semester INT,
    section TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLASSROOMS
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    academic_year INT NOT NULL,
    semester INT,
    section TEXT NOT NULL,
    academic_session TEXT NOT NULL,
    description TEXT,
    invitation_code TEXT NOT NULL UNIQUE,
    join_policy TEXT NOT NULL DEFAULT 'OPEN_CODE' CHECK (join_policy IN ('OPEN_CODE', 'REQUIRE_APPROVAL', 'CLOSED')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CLASSROOM MEMBERSHIPS
CREATE TABLE IF NOT EXISTS classroom_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_APPROVAL', 'REMOVED')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(classroom_id, user_id)
);

-- 4. SQL TOPICS
CREATE TABLE IF NOT EXISTS sql_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. QUESTIONS (Question Bank)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL, -- NULL = global faculty question bank
    title TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    topic_id UUID REFERENCES sql_topics(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED')),
    question_type TEXT NOT NULL DEFAULT 'QUERY_WRITING' CHECK (question_type IN ('QUERY_WRITING', 'PREDICT_OUTPUT', 'FIND_ERROR', 'MCQ', 'EXPLAIN_QUERY', 'THEORY')),
    marks NUMERIC NOT NULL DEFAULT 10,
    estimated_minutes INT DEFAULT 15,
    schema_ddl TEXT NOT NULL,
    seed_data_sql TEXT NOT NULL,
    expected_output_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_sensitive BOOLEAN NOT NULL DEFAULT false,
    reference_query TEXT NOT NULL,
    options JSONB,
    hints JSONB DEFAULT '[]'::jsonb,
    explanation TEXT,
    tags TEXT[] DEFAULT '{}'::text[],
    attachments JSONB DEFAULT '[]'::jsonb,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ASSESSMENTS
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('PRACTICE', 'TOPIC_TEST', 'WEEKLY_TEST', 'ASSIGNMENT', 'MOCK_TEST', 'TIMED_EXAM')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    total_marks NUMERIC NOT NULL DEFAULT 0,
    passing_marks NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'CLOSED', 'RESULTS_PUBLISHED')),
    settings JSONB NOT NULL DEFAULT '{
        "randomize_questions": false,
        "allow_late": false,
        "immediate_feedback": false,
        "release_solutions": false,
        "max_attempts": 1
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ASSESSMENT QUESTIONS
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    marks NUMERIC NOT NULL,
    UNIQUE(assessment_id, question_id)
);

-- 8. ASSESSMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT', 'EVALUATED')),
    total_score NUMERIC DEFAULT 0,
    auto_score NUMERIC DEFAULT 0,
    manual_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    submitted_code_or_text TEXT,
    selected_option_id TEXT,
    execution_status TEXT DEFAULT 'NOT_RUN',
    execution_output JSONB,
    is_correct BOOLEAN,
    awarded_marks NUMERIC DEFAULT 0,
    evaluation_type TEXT DEFAULT 'AUTO' CHECK (evaluation_type IN ('AUTO', 'MANUAL', 'MIXED')),
    teacher_feedback TEXT,
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 10. ASSESSMENT RESULTS
CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL UNIQUE REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    total_marks NUMERIC NOT NULL,
    marks_obtained NUMERIC NOT NULL,
    percentage NUMERIC NOT NULL,
    publication_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (publication_status IN ('DRAFT', 'PUBLISHED')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MARKS HISTORY (Audit trail for grade revisions)
CREATE TABLE IF NOT EXISTS marks_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id),
    previous_marks NUMERIC NOT NULL,
    new_marks NUMERIC NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('PDF', 'DOCUMENT', 'SQL', 'LINK', 'NOTE')),
    topic_id UUID REFERENCES sql_topics(id) ON DELETE SET NULL,
    file_url TEXT,
    external_url TEXT,
    content TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- OPTIMIZED PERFORMANCE INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(invitation_code);
CREATE INDEX IF NOT EXISTS idx_memberships_user_room ON classroom_memberships(user_id, classroom_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_classroom ON questions(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assessments_classroom ON assessments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment_student ON assessment_attempts(assessment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_attempt ON submissions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_materials_classroom ON study_materials(classroom_id);
CREATE INDEX IF NOT EXISTS idx_announcements_classroom ON announcements(classroom_id);
