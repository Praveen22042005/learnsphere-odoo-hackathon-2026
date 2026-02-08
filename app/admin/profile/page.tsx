"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Mail, Shield, Clock, Key } from "lucide-react";

export default function AdminProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">Admin Profile</h2>
          <p className="text-muted-foreground">Your account details</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const role =
    (user?.publicMetadata as Record<string, string>)?.role || "admin";
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin";
  const email = user?.emailAddresses[0]?.emailAddress || "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Admin Profile</h2>
        <p className="text-muted-foreground">
          Your account information and details.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.imageUrl} alt={fullName} />
              <AvatarFallback className="text-xl">
                <UserCircle className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold">{fullName}</h3>
              <p className="text-muted-foreground">{email}</p>
              <div className="mt-2 flex justify-center gap-2 sm:justify-start">
                <Badge variant="destructive" className="capitalize">
                  {role}
                </Badge>
                <Badge variant="outline">Platform Administrator</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email</span>
              </div>
              <span className="text-sm font-medium">{email}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Role</span>
              </div>
              <Badge variant="destructive" className="capitalize">
                {role}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">User ID</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {user?.id}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined</span>
              </div>
              <span className="text-sm">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Sign In</span>
              </div>
              <span className="text-sm">
                {user?.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Permissions
            </CardTitle>
            <CardDescription>
              Your access level and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "Full user management access",
                "Course content management",
                "Platform analytics & reports",
                "System configuration",
                "Audit log access",
                "Payment & pricing management",
                "Email & notification settings",
                "Role & permission management",
              ].map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{perm}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
