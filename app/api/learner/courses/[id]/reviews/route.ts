import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/learner/courses/[id]/reviews — Get reviews for a course
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: courseId } = await params;
    const supabase = createServiceClient();

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        learner:users!reviews_learner_id_fkey(first_name, last_name, avatar_url)
      `,
      )
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch reviews error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 },
      );
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/learner/courses/[id]/reviews — Submit a review
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
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("learner_id", userData.id)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Must be enrolled to review" },
        { status: 403 },
      );
    }

    // Check for existing review — update instead
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("course_id", courseId)
      .eq("learner_id", userData.id)
      .single();

    let review;
    if (existingReview) {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          review_text: comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)
        .select(
          `
          *,
          learner:users!reviews_learner_id_fkey(first_name, last_name, avatar_url)
        `,
        )
        .single();

      if (error) throw error;
      review = data;
    } else {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          course_id: courseId,
          learner_id: userData.id,
          rating,
          review_text: comment || null,
          is_published: true,
        })
        .select(
          `
          *,
          learner:users!reviews_learner_id_fkey(first_name, last_name, avatar_url)
        `,
        )
        .single();

      if (error) throw error;
      review = data;
    }

    return NextResponse.json(
      { review },
      { status: existingReview ? 200 : 201 },
    );
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
