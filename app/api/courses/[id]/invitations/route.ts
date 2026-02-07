import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/admin";
import crypto from "crypto";

// GET /api/courses/[id]/invitations — List invitations
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

    const { data: invitations, error } = await supabase
      .from("course_invitations")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch invitations" },
        { status: 500 },
      );
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error("Invitations GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/courses/[id]/invitations — Invite learners by email
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
    const supabase = createServiceClient();

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { emails } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Emails array is required" },
        { status: 400 },
      );
    }

    const invitations = emails.map((email: string) => ({
      course_id: courseId,
      email: email.trim().toLowerCase(),
      invited_by: userData.id,
      token: crypto.randomUUID(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { data, error } = await supabase
      .from("course_invitations")
      .upsert(invitations, { onConflict: "token" })
      .select();

    if (error) {
      console.error("Invitation create error:", error);
      return NextResponse.json(
        { error: "Failed to create invitations" },
        { status: 500 },
      );
    }

    return NextResponse.json({ invitations: data }, { status: 201 });
  } catch (error) {
    console.error("Invitations POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
