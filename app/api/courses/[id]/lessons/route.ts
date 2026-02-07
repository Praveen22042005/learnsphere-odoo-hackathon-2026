import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/courses/[id]/lessons — Fetch lessons for a course
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

    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", id)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Lessons fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch lessons" },
        { status: 500 },
      );
    }

    return NextResponse.json({ lessons: lessons || [] });
  } catch (error) {
    console.error("Lessons GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/courses/[id]/lessons — Create a new lesson
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
    const { title, lesson_type } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 },
      );
    }

    const validTypes = ["video", "text", "quiz", "assignment"];
    if (!lesson_type || !validTypes.includes(lesson_type)) {
      return NextResponse.json(
        { error: "Valid lesson type is required" },
        { status: 400 },
      );
    }

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

    // Get the next order_index
    const { data: lastLesson } = await supabase
      .from("lessons")
      .select("order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastLesson?.order_index ?? -1) + 1;

    // Generate slug
    const slug =
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 80) +
      "-" +
      Date.now().toString(36);

    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: title.trim(),
        slug,
        lesson_type,
        order_index: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Lesson create error:", error);
      return NextResponse.json(
        { error: "Failed to create lesson" },
        { status: 500 },
      );
    }

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error("Lessons POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
