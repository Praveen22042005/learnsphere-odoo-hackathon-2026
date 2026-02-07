export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  LEARNER = "learner",
}

export interface RoleMetadata {
  role: UserRole;
}

export const DEFAULT_ROLE = UserRole.LEARNER;

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.INSTRUCTOR]: "Instructor",
  [UserRole.LEARNER]: "Learner",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]:
    "Full access to platform management, user administration, and system settings",
  [UserRole.INSTRUCTOR]:
    "Create and manage courses, track student progress, and grade assignments",
  [UserRole.LEARNER]:
    "Enroll in courses, complete assignments, and track personal learning progress",
};

// Type guard functions
export function isAdmin(role: string): boolean {
  return role === UserRole.ADMIN;
}

export function isInstructor(role: string): boolean {
  return role === UserRole.INSTRUCTOR;
}

export function isLearner(role: string): boolean {
  return role === UserRole.LEARNER;
}

// Helper function to validate if a string is a valid UserRole
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

// Helper function to get role label
export function getRoleLabel(role: UserRole | string): string {
  if (isValidRole(role)) {
    return ROLE_LABELS[role];
  }
  return "Unknown Role";
}

// Helper function to get role description
export function getRoleDescription(role: UserRole | string): string {
  if (isValidRole(role)) {
    return ROLE_DESCRIPTIONS[role];
  }
  return "";
}
