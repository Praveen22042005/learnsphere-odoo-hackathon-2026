import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// PUT /api/courses/[id]/quizzes/[quizId]/rewards — Upsert rewards for a quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quizId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();
    const { rewards } = body;

    if (!Array.isArray(rewards)) {
      return NextResponse.json(
        { error: "Rewards array is required" },
        { status: 400 },
      );
    }

    // Delete existing rewards and insert new ones
    await supabase.from("quiz_rewards").delete().eq("quiz_id", quizId);

    const rewardRows = rewards.map(
      (r: { attempt_number: number; points_awarded: number }) => ({
        quiz_id: quizId,
        attempt_number: r.attempt_number,
        points_awarded: r.points_awarded,
      }),
    );

    const { data, error } = await supabase
      .from("quiz_rewards")
      .insert(rewardRows)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save rewards" },
        { status: 500 },
      );
    }

    return NextResponse.json({ rewards: data });
  } catch (error) {
    console.error("Rewards PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
