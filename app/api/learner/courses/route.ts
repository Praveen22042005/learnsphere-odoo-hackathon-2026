import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/learner/courses — Browse published courses or get enrolled courses
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const enrolledOnly = searchParams.get("enrolled") === "true";

    // If enrolled=true, return user's enrolled courses with course details
    if (enrolledOnly) {
      if (!userId) {
        return NextResponse.json({ enrollments: [] });
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", userId)
        .single();

      if (!userData) {
        return NextResponse.json({ enrollments: [] });
      }

      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(
          "id, course_id, status, progress_percentage, enrolled_at, completed_at, last_accessed_at, course:courses(id, title, slug, thumbnail_url, description, tags, status, is_free, price, difficulty_level, category, estimated_duration_hours)",
        )
        .eq("learner_id", userData.id)
        .order("enrolled_at", { ascending: false });

      if (error) {
        console.error("Enrolled courses error:", error);
        return NextResponse.json(
          { error: "Failed to fetch enrollments" },
          { status: 500 },
        );
      }

      return NextResponse.json({ enrollments: enrollments || [] });
    }

    // Browse mode: return published courses
    let query = supabase
      .from("courses")
      .select("*, lessons(id)")
      .eq("status", "published");

    // Visibility: if not signed in, only "everyone" courses
    if (!userId) {
      query = query.eq("visibility", "everyone");
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: courses, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Browse courses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 },
      );
    }

    // Get enrollment status if user is signed in
    let enrollmentMap: Record<
      string,
      { status: string; progress_percentage: number }
    > = {};
    if (userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", userId)
        .single();

      if (userData) {
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("course_id, status, progress_percentage")
          .eq("learner_id", userData.id);

        if (enrollments) {
          enrollmentMap = Object.fromEntries(
            enrollments.map((e) => [
              e.course_id,
              { status: e.status, progress_percentage: e.progress_percentage },
            ]),
          );
        }
      }
    }

    const mapped = (courses || []).map((c) => ({
      ...c,
      lessons_count: c.lessons?.length || 0,
      lessons: undefined,
      enrollment: enrollmentMap[c.id] || null,
    }));

    // Build a flat enrollmentMap for the browse page: { courseId: "active" }
    const flatEnrollmentMap: Record<string, string> = {};
    for (const [courseId, info] of Object.entries(enrollmentMap)) {
      flatEnrollmentMap[courseId] = info.status;
    }

    return NextResponse.json({
      courses: mapped,
      enrollmentMap: flatEnrollmentMap,
    });
  } catch (error) {
    console.error("Learner courses GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
