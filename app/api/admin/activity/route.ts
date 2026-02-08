import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/roles";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/admin/activity — Fetch recent platform activity
export async function GET(req: NextRequest) {
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
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

    // Fetch recent enrollments, quiz attempts, reviews, and new users in parallel
    const [enrollmentsRes, quizRes, reviewsRes, usersRes] = await Promise.all([
      supabase
        .from("enrollments")
        .select(
          `
          id, status, created_at,
          learner:users!enrollments_learner_id_fkey(first_name, last_name, avatar_url),
          course:courses!enrollments_course_id_fkey(title)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(Math.ceil(limit / 4)),
      supabase
        .from("quiz_attempts")
        .select(
          `
          id, score, passed, created_at,
          learner:users!quiz_attempts_learner_id_fkey(first_name, last_name, avatar_url),
          quiz:quizzes(title, lesson:lessons(course:courses(title)))
        `,
        )
        .order("created_at", { ascending: false })
        .limit(Math.ceil(limit / 4)),
      supabase
        .from("reviews")
        .select(
          `
          id, rating, created_at, is_published,
          learner:users!reviews_learner_id_fkey(first_name, last_name, avatar_url),
          course:courses!reviews_course_id_fkey(title)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(Math.ceil(limit / 4)),
      supabase
        .from("users")
        .select("id, first_name, last_name, role, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(Math.ceil(limit / 4)),
    ]);

    // Merge all activities into a single timeline
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      user_name: string;
      user_avatar: string | null;
      metadata: Record<string, unknown>;
      created_at: string;
    }> = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enrollmentsRes.data?.forEach((e: any) => {
      const name =
        `${e.learner?.first_name || ""} ${e.learner?.last_name || ""}`.trim();
      activities.push({
        id: `enrollment-${e.id}`,
        type: "enrollment",
        description: `${name || "A user"} enrolled in "${e.course?.title || "a course"}"`,
        user_name: name,
        user_avatar: e.learner?.avatar_url,
        metadata: { status: e.status },
        created_at: e.created_at,
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quizRes.data?.forEach((q: any) => {
      const name =
        `${q.learner?.first_name || ""} ${q.learner?.last_name || ""}`.trim();
      const courseName = q.quiz?.lesson?.course?.title || "a course";
      activities.push({
        id: `quiz-${q.id}`,
        type: "quiz_attempt",
        description: `${name || "A user"} ${q.passed ? "passed" : "attempted"} a quiz in "${courseName}"`,
        user_name: name,
        user_avatar: q.learner?.avatar_url,
        metadata: { score: q.score, passed: q.passed },
        created_at: q.created_at,
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviewsRes.data?.forEach((r: any) => {
      const name =
        `${r.learner?.first_name || ""} ${r.learner?.last_name || ""}`.trim();
      activities.push({
        id: `review-${r.id}`,
        type: "review",
        description: `${name || "A user"} reviewed "${r.course?.title || "a course"}" (${r.rating}★)`,
        user_name: name,
        user_avatar: r.learner?.avatar_url,
        metadata: { rating: r.rating },
        created_at: r.created_at,
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usersRes.data?.forEach((u: any) => {
      const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
      activities.push({
        id: `user-${u.id}`,
        type: "user_joined",
        description: `${name || "A new user"} joined as ${u.role}`,
        user_name: name,
        user_avatar: u.avatar_url,
        metadata: { role: u.role },
        created_at: u.created_at,
      });
    });

    // Sort by date descending
    activities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error("Admin activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
