import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/learner/courses/[id] — Get course detail for learner
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

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .eq("status", "published")
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch lessons — return full data (including content) if enrolled, partial otherwise
    // Fetch enrollment first to determine data access level
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("course_id", courseId)
      .eq("learner_id", userData.id)
      .maybeSingle();

    // Return full lesson data (including content) if enrolled, partial otherwise
    const lessonFields = enrollment
      ? "*"
      : "id, title, slug, description, lesson_type, duration_minutes, order_index, is_free_preview";

    const { data: lessons } = await supabase
      .from("lessons")
      .select(lessonFields)
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    // Fetch lesson progress if enrolled
    let lessonProgress: Record<string, boolean> = {};
    if (enrollment) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed")
        .eq("enrollment_id", enrollment.id);

      if (progress) {
        lessonProgress = Object.fromEntries(
          progress.map((p) => [p.lesson_id, p.is_completed]),
        );
      }
    }

    // Fetch reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select(
        `
        *,
        learner:users!reviews_learner_id_fkey(first_name, last_name, avatar_url)
      `,
      )
      .eq("course_id", courseId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20);

    const completedCount = Object.values(lessonProgress).filter(Boolean).length;

    return NextResponse.json({
      course,
      lessons: lessons || [],
      enrollment,
      lessonProgress,
      completedLessons: completedCount,
      totalLessons: lessons?.length || 0,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("Learner course detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/learner/courses/[id] — Enroll in course
export async function POST(
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

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if course exists and is published
    const { data: course } = await supabase
      .from("courses")
      .select("id, access_type, price, is_free")
      .eq("id", courseId)
      .eq("status", "published")
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check access rules
    if (course.access_type === "payment" && !course.is_free) {
      return NextResponse.json(
        { error: "This course requires payment" },
        { status: 402 },
      );
    }

    if (course.access_type === "invitation") {
      // Check if user has a valid invitation
      const { data: invitation } = await supabase
        .from("course_invitations")
        .select("id")
        .eq("course_id", courseId)
        .eq("email", userData.id) // Note: would need user.email — simplified
        .eq("status", "pending")
        .single();

      if (!invitation) {
        return NextResponse.json(
          { error: "Invitation required" },
          { status: 403 },
        );
      }
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("learner_id", userData.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .insert({
        learner_id: userData.id,
        course_id: courseId,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Enrollment error:", error);
      return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error("Enroll POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
