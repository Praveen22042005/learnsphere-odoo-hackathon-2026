/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";

// GET /api/learner/profile — Get learner profile with points, badges, achievements
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

    // Fetch or create learner profile
    let { data: profile } = await supabase
      .from("learner_profiles")
      .select("*")
      .eq("user_id", userData.id)
      .single();

    if (!profile) {
      const { data: newProfile } = await supabase
        .from("learner_profiles")
        .insert({ user_id: userData.id, points: 0, level: 1 })
        .select()
        .single();
      profile = newProfile;
    }

    // Fetch badges
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select(
        `
        *,
        badge:badges(*)
      `,
      )
      .eq("user_id", userData.id)
      .order("earned_at", { ascending: false });

    // Fetch achievements
    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select(
        `
        *,
        achievement:achievements(*)
      `,
      )
      .eq("user_id", userData.id)
      .order("earned_at", { ascending: false });

    // Fetch enrollment stats
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, status, progress_percentage")
      .eq("learner_id", userData.id);

    const stats = {
      totalCourses: enrollments?.length || 0,
      completedCourses:
        enrollments?.filter((e) => e.status === "completed").length || 0,
      activeCourses:
        enrollments?.filter((e) => e.status === "active").length || 0,
      averageProgress: enrollments?.length
        ? Math.round(
            enrollments.reduce(
              (sum, e) => sum + (e.progress_percentage || 0),
              0,
            ) / enrollments.length,
          )
        : 0,
    };

    // Fetch quiz stats
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select("id, score, passed, points_earned")
      .eq("learner_id", userData.id);

    const quizStats = {
      totalAttempts: quizAttempts?.length || 0,
      passedQuizzes: quizAttempts?.filter((a) => a.passed).length || 0,
      averageScore: quizAttempts?.length
        ? Math.round(
            quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
              quizAttempts.length,
          )
        : 0,
      totalPointsFromQuizzes:
        quizAttempts?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0,
    };

    // Get current badge level
    const { data: allBadges } = await supabase
      .from("badges")
      .select("*")
      .order("min_points", { ascending: true });

    let currentBadge = null;
    let nextBadge = null;
    const totalPoints = profile?.points || 0;

    if (allBadges) {
      for (let i = 0; i < allBadges.length; i++) {
        if (totalPoints >= allBadges[i].min_points) {
          currentBadge = allBadges[i];
          nextBadge = allBadges[i + 1] || null;
        }
      }
    }

    return NextResponse.json({
      user: userData,
      profile,
      badges: userBadges || [],
      achievements: userAchievements || [],
      stats,
      quizStats,
      currentBadge,
      nextBadge,
      totalPoints,
    });
  } catch (error) {
    console.error("Learner profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/learner/profile — Update learner profile
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

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.preferred_language !== undefined)
      updateData.preferred_language = body.preferred_language;
    if (body.learning_goals !== undefined)
      updateData.learning_goals = body.learning_goals;

    const { data: profile, error } = await supabase
      .from("learner_profiles")
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

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
