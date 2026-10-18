-- =========================================================================
-- TeachQL Complete Database Schema & RLS Policies
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
    roll_number TEXT,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    academic_year INTEGER NOT NULL DEFAULT 1,
    semester INTEGER,
    section TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CLASSROOMS
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    semester INTEGER,
    section TEXT NOT NULL,
    academic_session TEXT NOT NULL,
    description TEXT,
    invitation_code TEXT NOT NULL UNIQUE,
    join_policy TEXT NOT NULL DEFAULT 'open_code' CHECK (join_policy IN ('open_code', 'require_approval', 'closed')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CLASSROOM MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.classroom_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'pending_approval', 'removed')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(classroom_id, student_id)
);

-- 4. SQL TOPICS
CREATE TABLE IF NOT EXISTS public.sql_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. QUESTIONS (Question Bank)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE SET NULL, -- Null if global bank
    title TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    topic_id UUID REFERENCES public.sql_topics(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'easy', 'medium', 'hard', 'advanced')),
    question_type TEXT NOT NULL DEFAULT 'query_writing' CHECK (question_type IN ('query_writing', 'predict_output', 'find_error', 'mcq', 'explain_query', 'theory')),
    marks NUMERIC NOT NULL DEFAULT 10,
    estimated_minutes INTEGER DEFAULT 15,
    schema_ddl TEXT NOT NULL,
    seed_data_sql TEXT NOT NULL,
    expected_output_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_sensitive BOOLEAN NOT NULL DEFAULT false,
    reference_query TEXT NOT NULL,
    options JSONB, -- For MCQ questions: array of {id, text, is_correct}
    hints JSONB DEFAULT '[]'::jsonb,
    explanation TEXT,
    tags TEXT[] DEFAULT '{}'::text[],
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('practice', 'topic_test', 'weekly_test', 'assignment', 'mock_test', 'timed_exam')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_marks NUMERIC NOT NULL DEFAULT 0,
    passing_marks NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'closed', 'results_published')),
    settings JSONB NOT NULL DEFAULT '{
        "randomize_questions": false,
        "allow_late": false,
        "immediate_feedback": false,
        "release_solutions": false,
        "max_attempts": 1
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ASSESSMENT QUESTIONS
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    marks NUMERIC NOT NULL,
    UNIQUE(assessment_id, question_id)
);

-- 8. ASSESSMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'timed_out', 'evaluated')),
    total_score NUMERIC DEFAULT 0,
    auto_score NUMERIC DEFAULT 0,
    manual_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. SUBMISSIONS (Question-level answer within an attempt)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    submitted_code_or_text TEXT,
    selected_option_id TEXT,
    execution_status TEXT DEFAULT 'not_run',
    execution_output JSONB,
    is_correct BOOLEAN,
    awarded_marks NUMERIC DEFAULT 0,
    evaluation_type TEXT DEFAULT 'auto' CHECK (evaluation_type IN ('auto', 'manual', 'mixed')),
    teacher_feedback TEXT,
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(attempt_id, question_id)
);

-- 10. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'document', 'sql', 'link', 'note')),
    topic_id UUID REFERENCES public.sql_topics(id) ON DELETE SET NULL,
    file_url TEXT,
    external_url TEXT,
    content TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_memberships_classroom_student ON public.classroom_memberships(classroom_id, student_id);
CREATE INDEX IF NOT EXISTS idx_memberships_student ON public.classroom_memberships(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_classroom ON public.questions(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assessments_classroom ON public.assessments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions ON public.assessment_questions(assessment_id, question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment_student ON public.assessment_attempts(assessment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_attempt_question ON public.submissions(attempt_id, question_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own permitted profile fields" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. CLASSROOMS POLICIES
CREATE POLICY "Teachers can view, create and manage their own classrooms" 
ON public.classrooms FOR ALL TO authenticated 
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classrooms they are enrolled in" 
ON public.classrooms FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_memberships cm 
        WHERE cm.classroom_id = classrooms.id 
          AND cm.student_id = auth.uid() 
          AND cm.status = 'enrolled'
    )
);

-- 3. CLASSROOM MEMBERSHIPS POLICIES
CREATE POLICY "Teachers can manage memberships of their classrooms" 
ON public.classroom_memberships FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.classrooms c 
        WHERE c.id = classroom_memberships.classroom_id 
          AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view their own memberships" 
ON public.classroom_memberships FOR SELECT TO authenticated 
USING (student_id = auth.uid());

-- 4. SQL TOPICS (Publicly readable by all authenticated users)
CREATE POLICY "Topics are viewable by authenticated users" 
ON public.sql_topics FOR SELECT TO authenticated USING (true);

-- 5. QUESTIONS POLICIES
CREATE POLICY "Teachers can manage questions they authored or in their rooms" 
ON public.questions FOR ALL TO authenticated 
USING (
    created_by = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.classrooms c 
        WHERE c.id = questions.classroom_id 
          AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view questions assigned in their active assessments" 
ON public.questions FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assessment_questions aq
        JOIN public.assessments a ON a.id = aq.assessment_id
        JOIN public.classroom_memberships cm ON cm.classroom_id = a.classroom_id
        WHERE aq.question_id = questions.id 
          AND cm.student_id = auth.uid()
          AND cm.status = 'enrolled'
          AND a.status IN ('published', 'closed', 'results_published')
    )
);

-- 6. ASSESSMENTS POLICIES
CREATE POLICY "Teachers can manage their own room assessments" 
ON public.assessments FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.classrooms c 
        WHERE c.id = assessments.classroom_id 
          AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view published assessments in their rooms" 
ON public.assessments FOR SELECT TO authenticated 
USING (
    status IN ('published', 'closed', 'results_published') AND
    EXISTS (
        SELECT 1 FROM public.classroom_memberships cm 
        WHERE cm.classroom_id = assessments.classroom_id 
          AND cm.student_id = auth.uid() 
          AND cm.status = 'enrolled'
    )
);

-- 7. ASSESSMENT QUESTIONS POLICIES
CREATE POLICY "Teachers can manage assessment questions" 
ON public.assessment_questions FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assessments a
        JOIN public.classrooms c ON c.id = a.classroom_id
        WHERE a.id = assessment_questions.assessment_id
          AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view questions for available assessments" 
ON public.assessment_questions FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assessments a
        JOIN public.classroom_memberships cm ON cm.classroom_id = a.classroom_id
        WHERE a.id = assessment_questions.assessment_id
          AND cm.student_id = auth.uid()
          AND cm.status = 'enrolled'
          AND a.status IN ('published', 'closed', 'results_published')
    )
);

-- 8. ATTEMPTS POLICIES
CREATE POLICY "Students can manage their own attempts" 
ON public.assessment_attempts FOR ALL TO authenticated 
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view attempts in their classrooms" 
ON public.assessment_attempts FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assessments a
        JOIN public.classrooms c ON c.id = a.classroom_id
        WHERE a.id = assessment_attempts.assessment_id
          AND c.teacher_id = auth.uid()
    )
);

-- 9. SUBMISSIONS POLICIES
CREATE POLICY "Students can manage their own submissions via their attempts" 
ON public.submissions FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assessment_attempts aa 
        WHERE aa.id = submissions.attempt_id 
          AND aa.student_id = auth.uid()
    )
);

CREATE POLICY "Teachers can evaluate submissions in their classrooms" 
ON public.submissions FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.assessment_attempts aa
        JOIN public.assessments a ON a.id = aa.assessment_id
        JOIN public.classrooms c ON c.id = a.classroom_id
        WHERE aa.id = submissions.attempt_id
          AND c.teacher_id = auth.uid()
    )
);

-- 10. STUDY MATERIALS & ANNOUNCEMENTS
CREATE POLICY "Teachers manage materials in their classrooms" 
ON public.study_materials FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.classrooms c 
        WHERE c.id = study_materials.classroom_id 
          AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students view published materials in enrolled rooms" 
ON public.study_materials FOR SELECT TO authenticated 
USING (
    is_published = true AND
    EXISTS (
        SELECT 1 FROM public.classroom_memberships cm 
        WHERE cm.classroom_id = study_materials.classroom_id 
          AND cm.student_id = auth.uid() 
          AND cm.status = 'enrolled'
    )
);

CREATE POLICY "Teachers manage announcements in their classrooms" 
ON public.announcements FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.classrooms c 
        WHERE c.id = announcements.classroom_id 
          AND c.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students view announcements in enrolled rooms" 
ON public.announcements FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_memberships cm 
        WHERE cm.classroom_id = announcements.classroom_id 
          AND cm.student_id = auth.uid() 
          AND cm.status = 'enrolled'
    )
);

-- 11. NOTIFICATIONS
CREATE POLICY "Users can view and manage their own notifications" 
ON public.notifications FOR ALL TO authenticated 
USING (user_id = auth.uid());
