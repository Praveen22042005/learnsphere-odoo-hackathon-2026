import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/courses/[id]/enrollments — List attendees (instructor)
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

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(
        `
        *,
        learner:users!enrollments_learner_id_fkey(first_name, last_name, email, avatar_url)
      `,
      )
      .eq("course_id", courseId)
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Enrollments fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch enrollments" },
        { status: 500 },
      );
    }

    return NextResponse.json({ enrollments: enrollments || [] });
  } catch (error) {
    console.error("Enrollments GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
