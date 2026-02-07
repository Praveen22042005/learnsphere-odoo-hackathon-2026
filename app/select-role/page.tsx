"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/types/roles";
import { BookOpen, GraduationCap, UserCircle, Loader2 } from "lucide-react";

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "ADMIN2026";

export default function SelectRolePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.LEARNER);
  const [adminCode, setAdminCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user already has a role and redirect
  useEffect(() => {
    if (isLoaded && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingRole = (user.publicMetadata as any)?.role;
      if (existingRole) {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, router]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    // Validate admin code if admin role selected
    if (selectedRole === UserRole.ADMIN) {
      if (adminCode !== ADMIN_CODE) {
        setError("Invalid admin code. Please contact your administrator.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Call API to update user metadata with selected role
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          adminCode: selectedRole === UserRole.ADMIN ? adminCode : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to set role");
      }

      // Reload user data from Clerk to get updated publicMetadata
      await user.reload();

      // Redirect directly to role-specific dashboard
      switch (selectedRole) {
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
          router.replace("/dashboard");
      }
    } catch (err) {
      console.error("Error setting role:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set role. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: UserRole.LEARNER,
      label: ROLE_LABELS[UserRole.LEARNER],
      description: ROLE_DESCRIPTIONS[UserRole.LEARNER],
      icon: BookOpen,
    },
    {
      value: UserRole.INSTRUCTOR,
      label: ROLE_LABELS[UserRole.INSTRUCTOR],
      description: ROLE_DESCRIPTIONS[UserRole.INSTRUCTOR],
      icon: GraduationCap,
    },
    {
      value: UserRole.ADMIN,
      label: ROLE_LABELS[UserRole.ADMIN],
      description: ROLE_DESCRIPTIONS[UserRole.ADMIN],
      icon: UserCircle,
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-odoo-light/20 via-background to-background" />

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">
            Choose Your Role
          </CardTitle>
          <CardDescription>
            Select how you&apos;ll be using LearnSphere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
          >
            {roleOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className="flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary hover:bg-accent"
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <option.icon className="h-5 w-5 text-primary" />
                    <span className="font-heading font-semibold">
                      {option.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>

          {selectedRole === UserRole.ADMIN && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
              <Label htmlFor="adminCode" className="text-sm font-medium">
                Admin Access Code
              </Label>
              <Input
                id="adminCode"
                type="password"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Admin access requires a special code. Contact your administrator
                if you need this access.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Setting up your account..." : "Continue to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
