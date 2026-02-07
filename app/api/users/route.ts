import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/roles";

// GET all users (Admin only)
export async function GET(req: Request) {
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

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch users from Clerk
    const client = await clerkClient();
    const { data: users, totalCount } = await client.users.getUserList({
      limit,
      offset,
    });

    // Format user data
    const formattedUsers = users.map((user) => ({
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
    }));

    return NextResponse.json(
      {
        users: formattedUsers,
        totalCount,
        limit,
        offset,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST create user (Admin only)
export async function POST(req: Request) {
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

    // Parse request body
    const body = await req.json();
    const { email, firstName, lastName, password, role: userRole } = body;

    // Validate required fields
    if (!email || !firstName || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, password" },
        { status: 400 },
      );
    }

    // Create user in Clerk
    const client = await clerkClient();
    const newUser = await client.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password,
      publicMetadata: {
        role: userRole || UserRole.LEARNER,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.emailAddresses[0]?.emailAddress,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: (newUser.publicMetadata as any)?.role || UserRole.LEARNER,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
