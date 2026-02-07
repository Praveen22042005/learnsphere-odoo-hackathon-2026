/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@clerk/nextjs/server";
import { UserRole, DEFAULT_ROLE, isValidRole } from "@/types/roles";

/**
 * Extracts and validates the user role from Clerk auth session claims.
 * Returns DEFAULT_ROLE if role is missing or invalid.
 */
export async function getUserRole(
  authObj: Awaited<ReturnType<typeof auth>>,
): Promise<UserRole> {
  try {
    const role = (authObj.sessionClaims?.metadata as any)?.role as
      | string
      | undefined;

    // Check if role exists and is valid
    if (role && isValidRole(role)) {
      return role as UserRole;
    }

    // Return default role if invalid or missing
    return DEFAULT_ROLE;
  } catch (error) {
    console.error("Error getting user role:", error);
    return DEFAULT_ROLE;
  }
}

/**
 * Checks if the authenticated user has a specific role.
 */
export async function hasRole(
  authObj: Awaited<ReturnType<typeof auth>>,
  requiredRole: UserRole,
): Promise<boolean> {
  const userRole = await getUserRole(authObj);
  return userRole === requiredRole;
}

/**
 * Checks if the authenticated user has any of the specified roles.
 */
export async function hasAnyRole(
  authObj: Awaited<ReturnType<typeof auth>>,
  roles: UserRole[],
): Promise<boolean> {
  const userRole = await getUserRole(authObj);
  return roles.includes(userRole);
}

/**
 * Determines if a user with a given role can access a route requiring a specific role.
 * Implements role hierarchy:
 * - ADMIN: Can access all routes
 * - INSTRUCTOR: Can access INSTRUCTOR and LEARNER routes
 * - LEARNER: Can only access LEARNER routes
 */
export function canAccessRoute(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  // Admin has universal access
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // Instructor can access instructor and learner routes
  if (userRole === UserRole.INSTRUCTOR) {
    return (
      requiredRole === UserRole.INSTRUCTOR || requiredRole === UserRole.LEARNER
    );
  }

  // Learner can only access learner routes
  if (userRole === UserRole.LEARNER) {
    return requiredRole === UserRole.LEARNER;
  }

  // Default deny for unknown roles
  return false;
}

/**
 * Checks if the user can perform admin actions.
 */
export async function isUserAdmin(
  authObj: Awaited<ReturnType<typeof auth>>,
): Promise<boolean> {
  return await hasRole(authObj, UserRole.ADMIN);
}

/**
 * Checks if the user can perform instructor actions.
 */
export async function isUserInstructor(
  authObj: Awaited<ReturnType<typeof auth>>,
): Promise<boolean> {
  return await hasRole(authObj, UserRole.INSTRUCTOR);
}

/**
 * Checks if the user is a learner.
 */
export async function isUserLearner(
  authObj: Awaited<ReturnType<typeof auth>>,
): Promise<boolean> {
  return await hasRole(authObj, UserRole.LEARNER);
}

/**
 * Checks if the user can manage courses (Admin or Instructor).
 */
export async function canManageCourses(
  authObj: Awaited<ReturnType<typeof auth>>,
): Promise<boolean> {
  return await hasAnyRole(authObj, [UserRole.ADMIN, UserRole.INSTRUCTOR]);
}

/**
 * Checks if the user has elevated privileges (Admin or Instructor).
 */
export async function hasElevatedPrivileges(
  authObj: Awaited<ReturnType<typeof auth>>,
): Promise<boolean> {
  return await hasAnyRole(authObj, [UserRole.ADMIN, UserRole.INSTRUCTOR]);
}

/**
 * Gets role priority for sorting/comparison.
 * Higher number = more privileges.
 */
export function getRolePriority(role: UserRole): number {
  const priorities: Record<UserRole, number> = {
    [UserRole.ADMIN]: 3,
    [UserRole.INSTRUCTOR]: 2,
    [UserRole.LEARNER]: 1,
  };

  return priorities[role] || 0;
}

/**
 * Compares two roles and returns true if firstRole has higher or equal privileges.
 */
export function hasHigherOrEqualRole(
  firstRole: UserRole,
  secondRole: UserRole,
): boolean {
  return getRolePriority(firstRole) >= getRolePriority(secondRole);
}
