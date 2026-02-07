// Lesson types matching Supabase schema

export type LessonType =
  | "video"
  | "text"
  | "quiz"
  | "assignment"
  | "document"
  | "image";

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
  allow_download: boolean;
  file_url: string | null;
  external_video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonAttachment {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  attachment_type: "file" | "url";
  file_url: string | null;
  external_url: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_downloadable: boolean;
  order_index: number;
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
