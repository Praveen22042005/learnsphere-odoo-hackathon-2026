// Enrollment & Progress types

export type EnrollmentStatus = "active" | "completed" | "dropped";

export interface Enrollment {
  id: string;
  learner_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  time_spent_minutes: number;
  created_at: string;
  updated_at: string;
  // Joined
  course?: {
    title: string;
    slug: string;
    thumbnail_url: string | null;
    description: string | null;
    tags: string[] | null;
    status: string;
    is_free: boolean;
    price: number;
  };
  learner?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  is_completed: boolean;
  time_spent_minutes: number;
  last_position_seconds: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  course_id: string;
  learner_id: string;
  rating: number;
  review_text: string | null;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  learner?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface LearnerProfile {
  id: string;
  user_id: string;
  points: number;
  level: number;
  badges_count: number;
  courses_completed: number;
  total_learning_time_minutes: number;
  streak_days: number;
  last_activity_date: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface BadgeLevel {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  criteria: { min_points: number } | null;
  points_value: number;
  rarity: string | null;
}

export interface CourseInvitation {
  id: string;
  course_id: string;
  email: string;
  invited_by: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}
