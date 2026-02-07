import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// POST /api/learner/courses/[id]/progress — Update lesson progress
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
    const { lesson_id, is_completed, time_spent_minutes } = body;

    if (!lesson_id) {
      return NextResponse.json(
        { error: "lesson_id required" },
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

    // Find enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("learner_id", userData.id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    // Upsert lesson progress
    const { data: progress, error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          enrollment_id: enrollment.id,
          lesson_id,
          is_completed: is_completed ?? false,
          completed_at: is_completed ? new Date().toISOString() : null,
          time_spent_minutes: time_spent_minutes ?? 0,
        },
        { onConflict: "enrollment_id,lesson_id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Progress upsert error:", error);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 },
      );
    }

    // Calculate overall completion
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId);

    const { data: completedProgress } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("enrollment_id", enrollment.id)
      .eq("is_completed", true);

    const totalLessons = allLessons?.length || 0;
    const completedCount = completedProgress?.length || 0;
    const completionPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Update enrollment progress and status
    const enrollmentUpdate: Record<string, unknown> = {
      progress_percentage: completionPercentage,
    };

    if (completionPercentage === 100) {
      enrollmentUpdate.status = "completed";
      enrollmentUpdate.completed_at = new Date().toISOString();
    }

    if (time_spent_minutes) {
      // Increment time_spent_minutes
      const { data: currentEnrollment } = await supabase
        .from("enrollments")
        .select("time_spent_minutes")
        .eq("id", enrollment.id)
        .single();

      enrollmentUpdate.time_spent_minutes =
        (currentEnrollment?.time_spent_minutes || 0) + time_spent_minutes;
    }

    await supabase
      .from("enrollments")
      .update(enrollmentUpdate)
      .eq("id", enrollment.id);

    return NextResponse.json({
      progress,
      completionPercentage,
      completedCount,
      totalLessons,
    });
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
