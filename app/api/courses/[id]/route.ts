import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/courses/[id] — Fetch a single course with lessons
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .eq("instructor_id", userData.id)
      .single();

    if (error || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch lessons for this course
    const { data: lessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", id)
      .order("order_index", { ascending: true });

    return NextResponse.json({ course, lessons: lessons || [] });
  } catch (error) {
    console.error("Course GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/courses/[id] — Update a course
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
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
    const { data: existing } = await supabase
      .from("courses")
      .select("id")
      .eq("id", id)
      .eq("instructor_id", userData.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Allowed fields to update
    const allowedFields = [
      "title",
      "description",
      "thumbnail_url",
      "status",
      "category",
      "tags",
      "difficulty_level",
      "estimated_duration_hours",
      "price",
      "is_free",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // If publishing, set published_at
    if (updates.status === "published") {
      updates.published_at = new Date().toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const { data: course, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Course update error:", error);
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 },
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Course PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id] — Delete a course
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)
      .eq("instructor_id", userData.id);

    if (error) {
      console.error("Course delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete course" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
