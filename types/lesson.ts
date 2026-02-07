// Lesson types matching Supabase schema

export type LessonType = "video" | "text" | "quiz" | "assignment";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string | null;
  lesson_type: LessonType;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonPayload {
  course_id: string;
  title: string;
  lesson_type: LessonType;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string | null;
  lesson_type?: LessonType;
  content?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  order_index?: number;
  is_free_preview?: boolean;
}
