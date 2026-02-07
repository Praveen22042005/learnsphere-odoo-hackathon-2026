"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole, isValidRole } from "@/types/roles";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Redirect unauthenticated users to sign-in
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    // Get role from publicMetadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roleString = (user.publicMetadata as any)?.role as string | undefined;

    // If no role or invalid role, redirect to role selection
    if (!roleString || !isValidRole(roleString)) {
      router.replace("/select-role");
      return;
    }

    const role = roleString as UserRole;

    // Redirect based on role
    switch (role) {
      case UserRole.ADMIN:
        router.replace("/admin/dashboard");
        break;
      case UserRole.INSTRUCTOR:
        router.replace("/instructor/dashboard");
        break;
      case UserRole.LEARNER:
        router.replace("/learner/my-courses");
        break;
      default:
        router.replace("/select-role");
    }
  }, [isLoaded, user, router]);

  // Show loading spinner while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
