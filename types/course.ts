// Course types matching Supabase schema

export type CourseStatus = "draft" | "published" | "archived";
export type CourseVisibility = "everyone" | "signed_in";
export type CourseAccessType = "open" | "invitation" | "payment";

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  status: CourseStatus;
  category: string | null;
  tags: string[] | null;
  difficulty_level: string | null;
  estimated_duration_hours: number | null;
  price: number;
  is_free: boolean;
  enrollment_count: number;
  average_rating: number;
  total_reviews: number;
  visibility: CourseVisibility;
  access_type: CourseAccessType;
  course_admin_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined counts (from aggregation)
  lessons_count?: number;
  views_count?: number;
}

export interface CourseWithStats extends Course {
  lessons_count: number;
  views_count: number;
}

export interface CreateCoursePayload {
  title: string;
}

export interface CreateCourseResponse {
  course: Course;
}
