import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@/types/roles";

/**
 * Get the current authenticated user's role from Clerk.
 * This function properly retrieves the role from publicMetadata.
 *
 * @returns The user's role or null if not authenticated or no role set
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const authData = await auth();
    const { userId } = authData;

    if (!userId) {
      return null;
    }

    // Get user from Clerk to check role in publicMetadata
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (clerkUser.publicMetadata as any)?.role;

    return role || null;
  } catch (error) {
    console.error("Error getting current user role:", error);
    return null;
  }
}

/**
 * Check if the current user has the specified role.
 *
 * @param requiredRole - The role required for access
 * @returns true if user has the required role, false otherwise
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === requiredRole;
}

/**
 * Check if the current user has admin privileges.
 *
 * @returns true if user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN);
}

/**
 * Check if the current user has instructor privileges.
 *
 * @returns true if user is an instructor, false otherwise
 */
export async function isInstructor(): Promise<boolean> {
  return hasRole(UserRole.INSTRUCTOR);
}

/**
 * Check if the current user has learner privileges.
 *
 * @returns true if user is a learner, false otherwise
 */
export async function isLearner(): Promise<boolean> {
  return hasRole(UserRole.LEARNER);
}
