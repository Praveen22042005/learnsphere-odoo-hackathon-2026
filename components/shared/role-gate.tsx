/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "@clerk/nextjs";
import { UserRole, DEFAULT_ROLE, isValidRole } from "@/types/roles";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGate component for conditional rendering based on user roles.
 * Renders children only if user has one of the allowed roles.
 *
 * @example
 * <RoleGate allowedRoles={[UserRole.ADMIN, UserRole.INSTRUCTOR]}>
 *   <InstructorDashboard />
 * </RoleGate>
 *
 * @example
 * <RoleGate
 *   allowedRoles={[UserRole.ADMIN]}
 *   fallback={<p>You need admin access</p>}
 * >
 *   <AdminPanel />
 * </RoleGate>
 */
export default function RoleGate({
  allowedRoles,
  children,
  fallback,
}: RoleGateProps) {
  const { session, isLoaded } = useSession();

  // Show nothing while session is loading
  if (!isLoaded) {
    return null;
  }

  // Get user's role from session claims
  const role = (session?.user?.publicMetadata as any)?.role as
    | string
    | undefined;

  // Validate and get user role
  let userRole: UserRole = DEFAULT_ROLE;
  if (role && isValidRole(role)) {
    userRole = role as UserRole;
  }

  // Check if user has permission
  const hasPermission = allowedRoles.includes(userRole);

  // Render children if has permission, otherwise fallback
  if (hasPermission) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
