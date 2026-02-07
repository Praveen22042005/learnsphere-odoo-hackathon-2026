import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// PATCH /api/courses/[id]/lessons/[lessonId] — Update a lesson
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, lessonId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    // Verify instructor ownership
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

    // Allowed fields
    const allowedFields = [
      "title",
      "description",
      "lesson_type",
      "content",
      "video_url",
      "duration_minutes",
      "order_index",
      "is_free_preview",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data: lesson, error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .select()
      .single();

    if (error) {
      console.error("Lesson update error:", error);
      return NextResponse.json(
        { error: "Failed to update lesson" },
        { status: 500 },
      );
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Lesson PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id]/lessons/[lessonId] — Delete a lesson
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, lessonId } = await params;
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

    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId)
      .eq("course_id", courseId);

    if (error) {
      console.error("Lesson delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete lesson" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lesson DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
