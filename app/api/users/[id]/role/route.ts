import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole, isValidRole } from "@/types/roles";

// PUT/PATCH update user role (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authData = await auth();
    const { userId } = authData;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const sessionClaims = authData.sessionClaims;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (sessionClaims?.metadata as any)?.role;

    if (userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    // Validate role
    if (!role || !isValidRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user's public metadata with new role
    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(id, {
      publicMetadata: {
        role: role,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: updatedUser.id,
          email: updatedUser.emailAddresses[0]?.emailAddress,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: (updatedUser.publicMetadata as any)?.role || UserRole.LEARNER,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}

// PATCH is an alias for PUT
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return PUT(req, { params });
}
