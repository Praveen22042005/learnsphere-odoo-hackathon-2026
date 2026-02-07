import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/courses/[id]/quizzes/[quizId] — Get quiz with questions and rewards
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const supabase = createServiceClient();

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const [questionsRes, rewardsRes] = await Promise.all([
      supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index", { ascending: true }),
      supabase
        .from("quiz_rewards")
        .select("*")
        .eq("quiz_id", quizId)
        .order("attempt_number", { ascending: true }),
    ]);

    return NextResponse.json({
      quiz,
      questions: questionsRes.data || [],
      rewards: rewardsRes.data || [],
    });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/courses/[id]/quizzes/[quizId] — Update quiz
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, quizId } = await params;
    const supabase = createServiceClient();

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
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
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.passing_score !== undefined)
      updates.passing_score = body.passing_score;
    if (body.time_limit_minutes !== undefined)
      updates.time_limit_minutes = body.time_limit_minutes;

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .update(updates)
      .eq("id", quizId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update quiz" },
        { status: 500 },
      );
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Quiz PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id]/quizzes/[quizId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, quizId } = await params;
    const supabase = createServiceClient();

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

    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete quiz" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
