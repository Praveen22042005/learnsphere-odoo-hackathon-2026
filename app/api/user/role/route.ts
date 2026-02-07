import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole, isValidRole } from "@/types/roles";
import {
  syncClerkUserToSupabase,
  createRoleProfile,
  getSupabaseUser,
} from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    // Authenticate user
    const authData = await auth();
    const { userId } = authData;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { role, adminCode } = body;

    // Validate role
    if (!role || !isValidRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Validate admin code if admin role
    if (role === UserRole.ADMIN) {
      const expectedAdminCode =
        process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN2026";
      if (adminCode !== expectedAdminCode) {
        return NextResponse.json(
          { error: "Invalid admin code" },
          { status: 403 },
        );
      }
    }

    // Get Clerk user data
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Update user's public metadata with role in Clerk
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: role,
      },
    });

    // Sync to Supabase
    const supabaseUser = await syncClerkUserToSupabase(userId, {
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
      role: role,
    });

    // Create role-specific profile in Supabase
    await createRoleProfile(supabaseUser.id, role);

    return NextResponse.json({ success: true, role }, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 },
    );
  }
}
