import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/roles";
import { createServiceClient } from "@/utils/supabase/admin";

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

    // Run all queries in parallel
    const [
      usersResult,
      coursesResult,
      enrollmentsResult,
      completionsResult,
      revenueResult,
      instructorsResult,
      learnersResult,
      recentUsersResult,
      recentCoursesResult,
      quizAttemptsResult,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase.from("enrollments").select("id", { count: "exact", head: true }),
      supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase.from("courses").select("price").eq("status", "published"),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "instructor"),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("role", "learner"),
      supabase
        .from("users")
        .select("id, first_name, last_name, role, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("courses")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true }),
    ]);

    // Calculate estimated revenue (sum of course prices × enrollment count)
    const totalRevenue =
      revenueResult.data?.reduce((sum, c) => sum + (c.price || 0), 0) || 0;

    // Get enrollment trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: enrollmentTrend } = await supabase
      .from("enrollments")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Group enrollments by date
    const trendByDate: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      trendByDate[key] = 0;
    }
    enrollmentTrend?.forEach((e) => {
      const key = new Date(e.created_at).toISOString().split("T")[0];
      if (trendByDate[key] !== undefined) trendByDate[key]++;
    });

    const enrollmentTrendData = Object.entries(trendByDate).map(
      ([date, count]) => ({
        date,
        enrollments: count,
      }),
    );

    // User distribution
    const userDistribution = [
      {
        role: "Learners",
        count: learnersResult.count || 0,
        fill: "var(--color-learners)",
      },
      {
        role: "Instructors",
        count: instructorsResult.count || 0,
        fill: "var(--color-instructors)",
      },
      {
        role: "Admins",
        count:
          (usersResult.count || 0) -
          (learnersResult.count || 0) -
          (instructorsResult.count || 0),
        fill: "var(--color-admins)",
      },
    ];

    return NextResponse.json({
      stats: {
        totalUsers: usersResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0,
        totalCompletions: completionsResult.count || 0,
        totalRevenue,
        totalInstructors: instructorsResult.count || 0,
        totalLearners: learnersResult.count || 0,
        totalQuizAttempts: quizAttemptsResult.count || 0,
      },
      enrollmentTrend: enrollmentTrendData,
      userDistribution,
      recentUsers: recentUsersResult.data || [],
      recentCourses: recentCoursesResult.data || [],
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
