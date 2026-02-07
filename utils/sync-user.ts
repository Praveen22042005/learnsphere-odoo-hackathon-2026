import { currentUser } from "@clerk/nextjs/server";
import {
  userExistsInSupabase,
  syncClerkUserToSupabase,
  createRoleProfile,
  getSupabaseUser,
} from "./supabase/admin";

/**
 * Ensures that the current Clerk user exists in Supabase database.
 * This is a fallback sync mechanism in case webhook fails.
 * Safe to call multiple times (idempotent).
 *
 * @returns The Supabase user record or null if not authenticated
 */
export async function ensureUserInSupabase() {
  try {
    // Get current Clerk user
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    // Check if user already exists in Supabase
    const exists = await userExistsInSupabase(clerkUser.id);

    if (exists) {
      // User already synced, return existing record
      return await getSupabaseUser(clerkUser.id);
    }

    // User doesn't exist, sync now (webhook missed or not configured yet)
    console.log(`Fallback sync: Creating user in Supabase for ${clerkUser.id}`);

    // Get role from Clerk metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (clerkUser.publicMetadata as any)?.role || "learner";

    // Sync user to Supabase
    const supabaseUser = await syncClerkUserToSupabase(clerkUser.id, {
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
      role: role,
    });

    // Create role-specific profile
    await createRoleProfile(supabaseUser.id, role);

    console.log(`Fallback sync: User ${clerkUser.id} created in Supabase`);

    return supabaseUser;
  } catch (error) {
    console.error("Error ensuring user in Supabase:", error);
    // Don't throw - let the app continue even if sync fails
    return null;
  }
}

/**
 * Ensures a specific Clerk user exists in Supabase by user ID.
 * Useful for API routes or server actions.
 *
 * @param clerkUserId The Clerk user ID
 * @param userData Optional user data to sync
 * @returns The Supabase user record or null
 */
export async function ensureUserInSupabaseById(
  clerkUserId: string,
  userData?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    role?: string;
  },
) {
  try {
    // Check if user already exists
    const exists = await userExistsInSupabase(clerkUserId);

    if (exists) {
      return await getSupabaseUser(clerkUserId);
    }

    // User doesn't exist, sync now
    if (!userData) {
      throw new Error("User data required for first-time sync");
    }

    console.log(`Fallback sync: Creating user in Supabase for ${clerkUserId}`);

    const supabaseUser = await syncClerkUserToSupabase(clerkUserId, userData);

    // Create role-specific profile
    const role = userData.role || "learner";
    await createRoleProfile(supabaseUser.id, role);

    return supabaseUser;
  } catch (error) {
    console.error("Error ensuring user in Supabase by ID:", error);
    return null;
  }
}
