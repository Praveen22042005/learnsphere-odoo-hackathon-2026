import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role (bypasses RLS)
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables (URL or SERVICE_ROLE_KEY)",
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Sync Clerk user to Supabase
export async function syncClerkUserToSupabase(
  clerkUserId: string,
  userData: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    role?: string;
  },
) {
  const supabase = createServiceClient();

  try {
    // Upsert user (insert or update if exists)
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          clerk_user_id: clerkUserId,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          avatar_url: userData.avatarUrl,
          role: userData.role || "learner",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "clerk_user_id",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (userError) {
      console.error("Error syncing user to Supabase:", userError);
      throw userError;
    }

    return user;
  } catch (error) {
    console.error("Failed to sync user to Supabase:", error);
    throw error;
  }
}

// Create role-specific profile
export async function createRoleProfile(userId: string, role: string) {
  const supabase = createServiceClient();

  try {
    switch (role) {
      case "learner":
        const { error: learnerError } = await supabase
          .from("learner_profiles")
          .upsert(
            {
              user_id: userId,
              points: 0,
              level: 1,
              badges_count: 0,
              courses_completed: 0,
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: true,
            },
          );
        if (learnerError) throw learnerError;
        break;

      case "instructor":
        const { error: instructorError } = await supabase
          .from("instructor_profiles")
          .upsert(
            {
              user_id: userId,
              average_rating: 0,
              total_students: 0,
              total_courses: 0,
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: true,
            },
          );
        if (instructorError) throw instructorError;
        break;

      case "admin":
        const { error: adminError } = await supabase
          .from("admin_profiles")
          .upsert(
            {
              user_id: userId,
              permissions: {},
            },
            {
              onConflict: "user_id",
              ignoreDuplicates: true,
            },
          );
        if (adminError) throw adminError;
        break;
    }

    return true;
  } catch (error) {
    console.error("Failed to create role profile:", error);
    throw error;
  }
}

// Delete user from Supabase
export async function deleteUserFromSupabase(clerkUserId: string) {
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("clerk_user_id", clerkUserId);

    if (error) {
      console.error("Error deleting user from Supabase:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete user from Supabase:", error);
    throw error;
  }
}

// Check if user exists in Supabase
export async function userExistsInSupabase(
  clerkUserId: string,
): Promise<boolean> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the "no rows returned" error
      console.error("Error checking user existence:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Failed to check user existence:", error);
    return false;
  }
}

// Get Supabase user by Clerk ID
export async function getSupabaseUser(clerkUserId: string) {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error) {
      console.error("Error fetching user from Supabase:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch user from Supabase:", error);
    return null;
  }
}
