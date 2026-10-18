export type UserRole = 'teacher' | 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  roll_number?: string;
  department: string;
  course: string;
  academic_year: number;
  semester?: number;
  section: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  department: string;
  course: string;
  academic_year: number;
  semester?: number;
  section: string;
  academic_session: string;
  description?: string;
  invitation_code: string;
  join_policy: 'open_code' | 'require_approval' | 'closed';
  status: 'active' | 'archived';
  created_at: string;
  student_count?: number;
  active_tests_count?: number;
  pending_eval_count?: number;
}

export interface ClassroomMembership {
  id: string;
  classroom_id: string;
  student_id: string;
  status: 'enrolled' | 'pending_approval' | 'removed';
  enrolled_at: string;
  student?: UserProfile;
}

export interface SQLTopic {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order_index: number;
}

export type QuestionType =
  | 'query_writing'
  | 'predict_output'
  | 'find_error'
  | 'mcq'
  | 'explain_query'
  | 'theory';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'advanced';

export interface QuestionAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Base64 data URL for inline rendering, download, and viewer
  category: 'pdf' | 'image' | 'document' | 'other';
  uploaded_at: string;
  extractedText?: string;
}

export interface Question {
  id: string;
  created_by: string;
  classroom_id?: string | null;
  title: string;
  problem_statement: string;
  topic_id?: string;
  topic?: SQLTopic;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  marks: number;
  estimated_minutes?: number;
  schema_ddl: string;
  seed_data_sql: string;
  expected_output_json: any[];
  order_sensitive: boolean;
  reference_query: string;
  options?: { id: string; text: string; is_correct?: boolean }[];
  hints?: string[];
  explanation?: string;
  tags?: string[];
  attachments?: QuestionAttachment[];
  is_archived?: boolean;
  created_at?: string;
}

export type AssessmentType =
  | 'practice'
  | 'topic_test'
  | 'weekly_test'
  | 'assignment'
  | 'mock_test'
  | 'timed_exam';

export type AssessmentStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'closed'
  | 'results_published';

export interface AssessmentSettings {
  randomize_questions: boolean;
  allow_late: boolean;
  immediate_feedback: boolean;
  release_solutions: boolean;
  max_attempts: number;
}

export interface Assessment {
  id: string;
  classroom_id: string;
  created_by: string;
  title: string;
  description?: string;
  instructions?: string;
  assessment_type: AssessmentType;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks?: number;
  status: AssessmentStatus;
  settings: AssessmentSettings;
  created_at: string;
  questions?: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_id: string;
  order_index: number;
  marks: number;
  question?: Question;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  student_id: string;
  attempt_number: number;
  start_time: string;
  submitted_at?: string;
  status: 'in_progress' | 'submitted' | 'timed_out' | 'evaluated';
  total_score: number;
  auto_score: number;
  manual_score: number;
  submissions?: Submission[];
  student?: UserProfile;
}

export interface Submission {
  id: string;
  attempt_id: string;
  question_id: string;
  submitted_code_or_text?: string;
  selected_option_id?: string;
  execution_status?: 'success' | 'error' | 'not_run';
  execution_output?: any;
  is_correct?: boolean;
  awarded_marks: number;
  evaluation_type: 'auto' | 'manual' | 'mixed';
  teacher_feedback?: string;
  evaluated_at?: string;
  evaluated_by?: string;
  question?: Question;
}

export interface StudyMaterial {
  id: string;
  classroom_id: string;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'document' | 'sql' | 'link' | 'note';
  topic_id?: string;
  file_url?: string;
  external_url?: string;
  content?: string;
  is_published: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  classroom_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  classroom_id?: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
