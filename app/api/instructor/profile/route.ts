/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/instructor/profile — Get instructor profile
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch or create instructor profile
    let { data: profile } = await supabase
      .from("instructor_profiles")
      .select("*")
      .eq("user_id", userData.id)
      .single();

    if (!profile) {
      const { data: newProfile } = await supabase
        .from("instructor_profiles")
        .insert({
          user_id: userData.id,
          bio: "",
          expertise: [],
          average_rating: 0,
          total_students: 0,
          total_courses: 0,
        })
        .select()
        .single();
      profile = newProfile;
    }

    // Get course statistics
    const { data: courses } = await supabase
      .from("courses")
      .select("id, status")
      .eq("instructor_id", userData.id);

    const courseStats = {
      totalCourses: courses?.length || 0,
      publishedCourses:
        courses?.filter((c) => c.status === "published").length || 0,
      draftCourses: courses?.filter((c) => c.status === "draft").length || 0,
    };

    // Get total students (unique enrollments across all courses)
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("learner_id")
      .in("course_id", courses?.map((c) => c.id) || []);

    const uniqueStudents = new Set(enrollments?.map((e) => e.learner_id)).size;

    // Get average rating from course reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .in("course_id", courses?.map((c) => c.id) || []);

    const averageRating = reviews?.length
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(2)
      : 0;

    return NextResponse.json({
      user: userData,
      profile: {
        ...profile,
        total_students: uniqueStudents,
        average_rating: averageRating,
        total_courses: courseStats.publishedCourses,
      },
      courseStats,
    });
  } catch (error) {
    console.error("Instructor profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/instructor/profile — Update instructor profile
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Update instructor profile
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.expertise !== undefined) updateData.expertise = body.expertise;
    if (body.years_experience !== undefined)
      updateData.years_experience = body.years_experience;
    if (body.website_url !== undefined)
      updateData.website_url = body.website_url;
    if (body.linkedin_url !== undefined)
      updateData.linkedin_url = body.linkedin_url;

    const { data: profile, error } = await supabase
      .from("instructor_profiles")
      .update(updateData)
      .eq("user_id", userData.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    // Also update user's name if provided
    if (body.first_name !== undefined || body.last_name !== undefined) {
      const userUpdate: any = {};
      if (body.first_name !== undefined)
        userUpdate.first_name = body.first_name;
      if (body.last_name !== undefined) userUpdate.last_name = body.last_name;

      await supabase.from("users").update(userUpdate).eq("id", userData.id);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
