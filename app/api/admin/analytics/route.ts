import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/roles";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/admin/analytics — Enrollment trends, completions, course analytics
export async function GET() {
  try {
    const authData = await auth();
    const { userId } = authData;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (authData.sessionClaims?.metadata as Record<string, string>)
      ?.role;
    if (role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Get enrollment data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      enrollmentsRes,
      completionsRes,
      coursesWithEnrollments,
      quizStatsRes,
      lessonProgressRes,
    ] = await Promise.all([
      supabase
        .from("enrollments")
        .select("id, status, created_at, progress_percentage")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("enrollments")
        .select("id, created_at")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("courses")
        .select(
          `
          id, title, status, category,
          enrollments:enrollments(count),
          reviews:reviews(rating)
        `,
        )
        .eq("status", "published")
        .order("enrollment_count", { ascending: false })
        .limit(10),
      supabase
        .from("quiz_attempts")
        .select("id, score, passed, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("lesson_progress")
        .select("id, is_completed, time_spent_minutes")
        .eq("is_completed", true),
    ]);

    // Build enrollment trend for last 30 days
    const enrollmentTrend: Record<
      string,
      { enrollments: number; completions: number }
    > = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      enrollmentTrend[key] = { enrollments: 0, completions: 0 };
    }

    enrollmentsRes.data?.forEach((e) => {
      const key = new Date(e.created_at).toISOString().split("T")[0];
      if (enrollmentTrend[key]) enrollmentTrend[key].enrollments++;
    });

    completionsRes.data?.forEach((e) => {
      const key = new Date(e.created_at).toISOString().split("T")[0];
      if (enrollmentTrend[key]) enrollmentTrend[key].completions++;
    });

    const enrollmentTrendData = Object.entries(enrollmentTrend).map(
      ([date, data]) => ({
        date,
        ...data,
      }),
    );

    // Top courses by enrollment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topCourses = (coursesWithEnrollments.data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      enrollment_count: c.enrollments?.[0]?.count ?? 0,
      average_rating:
        c.reviews?.length > 0
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (
              c.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              c.reviews.length
            ).toFixed(1)
          : "N/A",
    }));

    // Course category distribution
    const categoryMap: Record<string, number> = {};
    coursesWithEnrollments.data?.forEach((c) => {
      const cat = c.category || "Uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryMap).map(
      ([name, count]) => ({
        category: name,
        count,
      }),
    );

    // Quiz pass rate
    const quizAttempts = quizStatsRes.data || [];
    const quizPassRate =
      quizAttempts.length > 0
        ? Math.round(
            (quizAttempts.filter((q) => q.passed).length /
              quizAttempts.length) *
              100,
          )
        : 0;

    // Average progress
    const enrollments = enrollmentsRes.data || [];
    const avgProgress =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce(
              (sum, e) => sum + (e.progress_percentage || 0),
              0,
            ) / enrollments.length,
          )
        : 0;

    // Total lesson time
    const totalTimeMinutes =
      lessonProgressRes.data?.reduce(
        (sum, l) => sum + (l.time_spent_minutes || 0),
        0,
      ) || 0;

    return NextResponse.json({
      enrollmentTrend: enrollmentTrendData,
      topCourses,
      categoryDistribution,
      summary: {
        totalEnrollments30d: enrollmentsRes.data?.length || 0,
        totalCompletions30d: completionsRes.data?.length || 0,
        quizPassRate,
        avgProgress,
        totalLearningHours: Math.round(totalTimeMinutes / 60),
        totalQuizAttempts30d: quizAttempts.length,
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
