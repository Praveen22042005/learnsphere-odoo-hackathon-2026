import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/courses/[id]/quizzes — List quizzes for a course
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const supabase = createServiceClient();

    // Get user ID for attempt lookup
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    // Get all lessons for this course first
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId);

    const lessonIds = (lessons || []).map((l) => l.id);

    // Fetch quizzes: either course_id matches OR lesson_id is in course's lessons
    let query = supabase.from("quizzes").select("*, quiz_questions(id)");

    if (lessonIds.length > 0) {
      // Get quizzes where course_id matches OR lesson_id is in this course
      query = query.or(
        `course_id.eq.${courseId},lesson_id.in.(${lessonIds.join(",")})`,
      );
    } else {
      // No lessons, just get course-level quizzes
      query = query.eq("course_id", courseId);
    }

    const { data: quizzes, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) {
      console.error("Quizzes fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch quizzes" },
        { status: 500 },
      );
    }

    // Fetch quiz attempts for this user
    const quizIds = (quizzes || []).map((q) => q.id);
    let attempts: Array<{
      quiz_id: string;
      score: number;
      passed: boolean;
      attempt_number: number;
      points_earned: number;
      completed_at: string;
    }> = [];

    if (userData && quizIds.length > 0) {
      const { data: attemptData } = await supabase
        .from("quiz_attempts")
        .select(
          "quiz_id, score, passed, attempt_number, points_earned, completed_at",
        )
        .eq("learner_id", userData.id)
        .in("quiz_id", quizIds)
        .order("completed_at", { ascending: false });

      attempts = attemptData || [];
    }

    // Create a map of quiz attempts
    const attemptsMap = new Map();
    for (const attempt of attempts) {
      if (!attemptsMap.has(attempt.quiz_id)) {
        attemptsMap.set(attempt.quiz_id, []);
      }
      attemptsMap.get(attempt.quiz_id).push(attempt);
    }

    const mapped = (quizzes || []).map((q) => {
      const quizAttempts = attemptsMap.get(q.id) || [];
      const bestAttempt = quizAttempts.length > 0 ? quizAttempts[0] : null;
      const hasCompleted = quizAttempts.some(
        (a: (typeof attempts)[0]) => a.passed,
      );

      return {
        ...q,
        questions_count: q.quiz_questions?.length || 0,
        quiz_questions: undefined,
        // Add attempt status
        attempt_count: quizAttempts.length,
        best_score: bestAttempt?.score || null,
        has_passed: hasCompleted,
        last_attempt: bestAttempt,
      };
    });

    return NextResponse.json({ quizzes: mapped });
  } catch (error) {
    console.error("Quizzes GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/courses/[id]/quizzes — Create a new quiz
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const supabase = createServiceClient();

    // Verify ownership
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .eq("instructor_id", userData.id)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, passing_score, time_limit_minutes } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 },
      );
    }

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        title,
        description: description || null,
        passing_score: passing_score || 70,
        time_limit_minutes: time_limit_minutes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Quiz create error:", error);
      return NextResponse.json(
        { error: "Failed to create quiz" },
        { status: 500 },
      );
    }

    // Create default rewards (4 attempts)
    const rewards = [
      { quiz_id: quiz.id, attempt_number: 1, points_awarded: 15 },
      { quiz_id: quiz.id, attempt_number: 2, points_awarded: 10 },
      { quiz_id: quiz.id, attempt_number: 3, points_awarded: 5 },
      { quiz_id: quiz.id, attempt_number: 4, points_awarded: 2 },
    ];

    await supabase.from("quiz_rewards").insert(rewards);

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Quizzes POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
