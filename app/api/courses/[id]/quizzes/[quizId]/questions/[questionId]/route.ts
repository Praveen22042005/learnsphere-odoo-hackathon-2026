import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// PATCH /api/courses/[id]/quizzes/[quizId]/questions/[questionId]
export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; quizId: string; questionId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.question_text !== undefined)
      updates.question_text = body.question_text;
    if (body.question_type !== undefined)
      updates.question_type = body.question_type;
    if (body.options !== undefined) updates.options = body.options;
    if (body.correct_answer !== undefined)
      updates.correct_answer = body.correct_answer;
    if (body.points !== undefined) updates.points = body.points;
    if (body.explanation !== undefined) updates.explanation = body.explanation;
    if (body.order_index !== undefined) updates.order_index = body.order_index;

    const { data: question, error } = await supabase
      .from("quiz_questions")
      .update(updates)
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update question" },
        { status: 500 },
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Question PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id]/quizzes/[quizId]/questions/[questionId]
export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; quizId: string; questionId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete question" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
