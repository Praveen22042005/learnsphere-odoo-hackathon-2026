import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./utils/supabase/middleware";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
]);
// Routes that require authentication but allow any role (including no role)
const isAuthOnlyRoute = createRouteMatcher([
  "/select-role",
  "/dashboard",
  "/api/user/role",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Allow access to public routes without checks
  if (isPublicRoute(req)) {
    return createClient(req);
  }

  // Protect all non-public routes (require authentication)
  await auth.protect();

  // For auth-only routes (select-role, dashboard), just require authentication
  // Role-based access control is handled at the page level
  if (isAuthOnlyRoute(req)) {
    return createClient(req);
  }

  // For role-protected routes (admin, instructor, learner),
  // defer to page-level checks since session claims may not have metadata
  // The individual pages will verify roles using clerkClient

  // Update Supabase session and return response
  return createClient(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
