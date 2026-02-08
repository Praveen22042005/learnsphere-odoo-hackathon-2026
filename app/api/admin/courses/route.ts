import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/roles";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/admin/courses — Fetch all courses (admin)
export async function GET(req: NextRequest) {
  try {
    const authData = await auth();
    const { userId } = authData;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (authData.sessionClaims?.metadata as Record<string, string>)
      ?.role;
    if (role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("courses")
      .select(
        `
        *,
        lessons:lessons(count),
        enrollments:enrollments(count),
        instructor:users!courses_instructor_id_fkey(id, first_name, last_name, email, avatar_url)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: courses, count, error } = await query;

    if (error) {
      console.error("Admin courses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 },
      );
    }

    const formattedCourses = (courses || []).map((course) => ({
      ...course,
      lessons_count: course.lessons?.[0]?.count ?? 0,
      enrollment_count: course.enrollments?.[0]?.count ?? 0,
      lessons: undefined,
      enrollments: undefined,
    }));

    return NextResponse.json({
      courses: formattedCourses,
      totalCount: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
