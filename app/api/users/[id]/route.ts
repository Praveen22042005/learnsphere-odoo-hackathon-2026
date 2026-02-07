import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/roles";

// GET single user (Admin only)
export async function GET(
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
    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Fetch user from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(id);

    // Format user data
    const formattedUser = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: (user.publicMetadata as any)?.role || UserRole.LEARNER,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      emailAddresses: user.emailAddresses.map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
        verification: email.verification,
      })),
    };

    return NextResponse.json({ user: formattedUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT update user (Admin only)
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
    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, password } = body;

    // Build update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (password) updateData.password = password;

    // Update user in Clerk
    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(id, updateData);

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
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE user (Admin only)
export async function DELETE(
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
    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Delete user from Clerk
    const client = await clerkClient();
    await client.users.deleteUser(id);

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
