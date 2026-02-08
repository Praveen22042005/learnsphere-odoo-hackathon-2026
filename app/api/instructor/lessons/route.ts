import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/instructor/lessons — Get all lessons for instructor's courses
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all courses for this instructor
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, status")
      .eq("instructor_id", userData.id)
      .order("created_at", { ascending: false });

    if (!courses || courses.length === 0) {
      return NextResponse.json({ lessons: [], courses: [] });
    }

    const courseIds = courses.map((c) => c.id);

    // Get all lessons for these courses
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("*")
      .in("course_id", courseIds)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Lessons fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch lessons" },
        { status: 500 },
      );
    }

    // Create a course map for quick lookup
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    // Enrich lessons with course info
    const enrichedLessons = (lessons || []).map((lesson) => ({
      ...lesson,
      course: courseMap.get(lesson.course_id) || null,
    }));

    // Calculate statistics
    const stats = {
      totalLessons: lessons?.length || 0,
      videoLessons:
        lessons?.filter((l) => l.lesson_type === "video").length || 0,
      textLessons: lessons?.filter((l) => l.lesson_type === "text").length || 0,
      quizLessons: lessons?.filter((l) => l.lesson_type === "quiz").length || 0,
      assignmentLessons:
        lessons?.filter((l) => l.lesson_type === "assignment").length || 0,
      publishedLessons:
        lessons?.filter((l) => {
          const course = courseMap.get(l.course_id);
          return course?.status === "published";
        }).length || 0,
    };

    return NextResponse.json({
      lessons: enrichedLessons,
      courses,
      stats,
    });
  } catch (error) {
    console.error("Instructor lessons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
