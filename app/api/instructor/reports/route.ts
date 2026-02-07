import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/instructor/reports — Get instructor reporting data
export async function GET(request: NextRequest) {
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

    const courseId = request.nextUrl.searchParams.get("courseId");

    // Fetch instructor's courses
    let coursesQuery = supabase
      .from("courses")
      .select("id, title, status, enrollment_count, average_rating, created_at")
      .eq("instructor_id", userData.id);

    if (courseId) {
      coursesQuery = coursesQuery.eq("id", courseId);
    }

    const { data: courses } = await coursesQuery;

    if (!courses || courses.length === 0) {
      return NextResponse.json({
        courses: [],
        overview: {
          totalStudents: 0,
          totalCourses: 0,
          averageCompletion: 0,
          averageRating: 0,
        },
        enrollmentsByDate: [],
        coursePerformance: [],
      });
    }

    const courseIds = courses.map((c) => c.id);

    // Fetch all enrollments for these courses
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(
        `
        id, course_id, status, progress_percentage, created_at, completed_at,
        learner:users!enrollments_learner_id_fkey(first_name, last_name, email, avatar_url)
      `,
      )
      .in("course_id", courseIds)
      .order("created_at", { ascending: false });

    // Fetch quiz attempts
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("id, quiz_id, score, passed, created_at")
      .in(
        "quiz_id",
        (
          await supabase.from("quizzes").select("id").in("course_id", courseIds)
        ).data?.map((q) => q.id) || [],
      );

    // Calculate overview
    const totalStudents = new Set(
      enrollments?.map((e) => JSON.stringify(e.learner)),
    ).size;
    const avgCompletion = enrollments?.length
      ? Math.round(
          enrollments.reduce(
            (sum, e) => sum + (e.progress_percentage || 0),
            0,
          ) / enrollments.length,
        )
      : 0;
    const avgRating =
      courses.reduce((sum, c) => sum + (c.average_rating || 0), 0) /
      courses.length;

    // Enrollments by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollmentsByDate: Record<string, number> = {};
    enrollments?.forEach((e) => {
      const date = new Date(e.created_at).toISOString().split("T")[0];
      enrollmentsByDate[date] = (enrollmentsByDate[date] || 0) + 1;
    });

    // Course performance
    const coursePerformance = courses.map((course) => {
      const courseEnrollments =
        enrollments?.filter((e) => e.course_id === course.id) || [];
      const completedCount = courseEnrollments.filter(
        (e) => e.status === "completed",
      ).length;
      const avgProgress = courseEnrollments.length
        ? Math.round(
            courseEnrollments.reduce(
              (sum, e) => sum + (e.progress_percentage || 0),
              0,
            ) / courseEnrollments.length,
          )
        : 0;

      return {
        courseId: course.id,
        title: course.title,
        enrollments: courseEnrollments.length,
        completions: completedCount,
        completionRate: courseEnrollments.length
          ? Math.round((completedCount / courseEnrollments.length) * 100)
          : 0,
        averageProgress: avgProgress,
        rating: course.average_rating || 0,
      };
    });

    // Quiz performance
    const quizPerformance = {
      totalAttempts: quizAttempts?.length || 0,
      passRate: quizAttempts?.length
        ? Math.round(
            (quizAttempts.filter((a) => a.passed).length /
              quizAttempts.length) *
              100,
          )
        : 0,
      averageScore: quizAttempts?.length
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
              quizAttempts.length,
          )
        : 0,
    };

    return NextResponse.json({
      courses,
      overview: {
        totalStudents,
        totalCourses: courses.length,
        averageCompletion: avgCompletion,
        averageRating: Math.round(avgRating * 10) / 10,
      },
      enrollmentsByDate: Object.entries(enrollmentsByDate).map(
        ([date, count]) => ({ date, count }),
      ),
      coursePerformance,
      quizPerformance,
      recentEnrollments: (enrollments || []).slice(0, 10),
    });
  } catch (error) {
    console.error("Instructor reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
