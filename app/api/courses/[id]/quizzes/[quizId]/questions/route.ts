import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// POST /api/courses/[id]/quizzes/[quizId]/questions — Create a question
export async function POST(
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

    const {
      question_text,
      question_type,
      options,
      correct_answer,
      points,
      explanation,
    } = body;

    if (!question_text || !question_type || !correct_answer) {
      return NextResponse.json(
        { error: "Question text, type, and correct answer are required" },
        { status: 400 },
      );
    }

    // Get next order_index
    const { data: existing } = await supabase
      .from("quiz_questions")
      .select("order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextIndex =
      existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

    const { data: question, error } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        question_text,
        question_type,
        options: options || null,
        correct_answer,
        points: points || 1,
        order_index: nextIndex,
        explanation: explanation || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Question create error:", error);
      return NextResponse.json(
        { error: "Failed to create question" },
        { status: 500 },
      );
    }

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Questions POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
