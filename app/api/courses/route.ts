import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/courses — Fetch courses for the current instructor
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Resolve Supabase user ID from Clerk ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    // Fetch courses with lesson count
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(
        `
        *,
        lessons:lessons(count)
      `,
      )
      .eq("instructor_id", userData.id)
      .order("updated_at", { ascending: false });

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 },
      );
    }

    // Transform to include lessons_count as a flat property
    const coursesWithStats = (courses || []).map((course) => ({
      ...course,
      lessons_count: course.lessons?.[0]?.count ?? 0,
      views_count: course.enrollment_count ?? 0,
      lessons: undefined,
    }));

    return NextResponse.json({ courses: coursesWithStats });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/courses — Create a new draft course
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Resolve Supabase user ID from Clerk ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 },
      );
    }

    if (userData.role !== "instructor" && userData.role !== "admin") {
      return NextResponse.json(
        { error: "Only instructors can create courses" },
        { status: 403 },
      );
    }

    // Generate slug from title
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

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        instructor_id: userData.id,
        title: title.trim(),
        slug,
        status: "draft",
      })
      .select()
      .single();

    if (courseError) {
      console.error("Error creating course:", courseError);
      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 },
      );
    }

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Courses POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
