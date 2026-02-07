import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// POST /api/learner/quizzes/[quizId]/attempt — Submit a quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const { answers } = body; // { [questionId]: userAnswer }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Answers object required" },
        { status: 400 },
      );
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

    // Fetch quiz with questions and rewards
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*, course_id")
      .eq("id", quizId)
      .single();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", quiz.course_id)
      .eq("learner_id", userData.id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "Must be enrolled" }, { status: 403 });
    }

    // Fetch questions
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Quiz has no questions" },
        { status: 400 },
      );
    }

    // Score the attempt
    let correctCount = 0;
    const questionResults: Record<
      string,
      { correct: boolean; correctAnswer: string }
    > = {};

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect =
        userAnswer?.toString().toLowerCase().trim() ===
        question.correct_answer?.toString().toLowerCase().trim();
      if (isCorrect) correctCount++;
      questionResults[question.id] = {
        correct: isCorrect,
        correctAnswer: question.correct_answer,
      };
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= (quiz.passing_score || 70);

    // Get attempt number
    const { count: previousAttempts } = await supabase
      .from("quiz_attempts")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quizId)
      .eq("learner_id", userData.id);

    const attemptNumber = (previousAttempts || 0) + 1;

    // Get reward points based on attempt number
    const { data: reward } = await supabase
      .from("quiz_rewards")
      .select("points")
      .eq("quiz_id", quizId)
      .eq("attempt_number", Math.min(attemptNumber, 4)) // Max defined is usually 4
      .single();

    const pointsEarned = passed ? reward?.points || 0 : 0;

    // Create the attempt record
    const { data: attempt, error } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        learner_id: userData.id,
        score,
        passed,
        attempt_number: attemptNumber,
        points_earned: pointsEarned,
        answers,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Quiz attempt error:", error);
      return NextResponse.json(
        { error: "Failed to submit attempt" },
        { status: 500 },
      );
    }

    // Update learner profile points if passed
    if (passed && pointsEarned > 0) {
      const { data: profile } = await supabase
        .from("learner_profiles")
        .select("total_points")
        .eq("user_id", userData.id)
        .single();

      if (profile) {
        const newTotal = (profile.total_points || 0) + pointsEarned;
        await supabase
          .from("learner_profiles")
          .update({ total_points: newTotal })
          .eq("user_id", userData.id);

        // Check for badge upgrades
        const { data: badges } = await supabase
          .from("badges")
          .select("*")
          .lte("min_points", newTotal)
          .order("min_points", { ascending: false });

        if (badges && badges.length > 0) {
          for (const badge of badges) {
            await supabase.from("user_badges").upsert(
              {
                user_id: userData.id,
                badge_id: badge.id,
                earned_at: new Date().toISOString(),
              },
              { onConflict: "user_id,badge_id" },
            );
          }
        }
      }
    }

    return NextResponse.json(
      {
        attempt,
        score,
        passed,
        pointsEarned,
        correctCount,
        totalQuestions: questions.length,
        questionResults,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Quiz attempt POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
