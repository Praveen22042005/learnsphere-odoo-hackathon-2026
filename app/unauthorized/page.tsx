/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ROLE_LABELS,
  UserRole,
  DEFAULT_ROLE,
  isValidRole,
} from "@/types/roles";

export default function UnauthorizedPage() {
  const { session } = useSession();
  const router = useRouter();

  // Get user role from session claims
  const role = (session?.user?.publicMetadata as any)?.role as
    | string
    | undefined;

  // Validate and get user role
  let userRole: UserRole = DEFAULT_ROLE;
  if (role && isValidRole(role)) {
    userRole = role as UserRole;
  }

  const roleLabel = ROLE_LABELS[userRole];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-odoo-light/20 via-background to-background" />

      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="font-heading text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            You don&apos;t have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your current role:{" "}
            <span className="font-semibold text-foreground">{roleLabel}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Please contact your administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
