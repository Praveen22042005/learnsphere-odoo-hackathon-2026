// Quiz types matching Supabase schema

export type QuizQuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer";

export interface Quiz {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  created_at: string;
  updated_at: string;
  // Joined
  questions_count?: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuizQuestionType;
  options: { label: string; value: string }[] | null;
  correct_answer: string;
  points: number;
  order_index: number;
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizReward {
  id: string;
  quiz_id: string;
  attempt_number: number;
  points_awarded: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  learner_id: string;
  quiz_id: string;
  score: number | null;
  total_questions: number | null;
  passed: boolean | null;
  time_taken_minutes: number | null;
  answers: Record<string, string> | null;
  attempt_number: number;
  points_earned: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface CreateQuizPayload {
  course_id: string;
  title: string;
  description?: string;
  passing_score?: number;
  time_limit_minutes?: number;
}

export interface CreateQuestionPayload {
  quiz_id: string;
  question_text: string;
  question_type: QuizQuestionType;
  options?: { label: string; value: string }[];
  correct_answer: string;
  points?: number;
  explanation?: string;
}
