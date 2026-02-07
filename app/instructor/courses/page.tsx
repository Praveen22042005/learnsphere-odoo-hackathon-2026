import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/utils/supabase/admin";
import { CoursesClient } from "./courses-client";
import type { CourseWithStats } from "@/types/course";

export default async function InstructorCoursesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createServiceClient();

  // Resolve Supabase user ID from Clerk ID
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  let courses: CourseWithStats[] = [];

  if (userData) {
    const { data: coursesData } = await supabase
      .from("courses")
      .select(
        `
        *,
        lessons:lessons(count)
      `,
      )
      .eq("instructor_id", userData.id)
      .order("updated_at", { ascending: false });

    courses = (coursesData || []).map((course) => ({
      ...course,
      lessons_count: course.lessons?.[0]?.count ?? 0,
      views_count: course.enrollment_count ?? 0,
      lessons: undefined,
    }));
  }

  return <CoursesClient initialCourses={courses} />;
}
