"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Eye,
  Settings,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const roles = [
  {
    name: "Admin",
    description: "Full platform access with system configuration rights",
    users: "—",
    badgeVariant: "destructive" as const,
    permissions: [
      "Manage all users & roles",
      "Access all courses",
      "View analytics & reports",
      "System configuration",
      "Audit log access",
      "Payment management",
    ],
  },
  {
    name: "Instructor",
    description: "Can create and manage their own courses and content",
    users: "—",
    badgeVariant: "default" as const,
    permissions: [
      "Create & edit own courses",
      "Manage lessons & quizzes",
      "View own course analytics",
      "Manage enrollments",
      "View student progress",
      "Respond to reviews",
    ],
  },
  {
    name: "Learner",
    description: "Can enroll in courses and track their learning progress",
    users: "—",
    badgeVariant: "secondary" as const,
    permissions: [
      "Browse & enroll in courses",
      "Take quizzes & assignments",
      "Track progress & points",
      "Earn badges",
      "Write course reviews",
      "View profile & achievements",
    ],
  },
];

const permissionMatrix = [
  {
    category: "User Management",
    icon: Users,
    permissions: [
      {
        name: "View all users",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "Change user roles",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "Deactivate accounts",
        admin: true,
        instructor: false,
        learner: false,
      },
    ],
  },
  {
    category: "Course Management",
    icon: BookOpen,
    permissions: [
      { name: "Create courses", admin: true, instructor: true, learner: false },
      {
        name: "Edit any course",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "Delete courses",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "Publish/unpublish",
        admin: true,
        instructor: true,
        learner: false,
      },
    ],
  },
  {
    category: "Analytics",
    icon: BarChart3,
    permissions: [
      {
        name: "View platform analytics",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "View own course stats",
        admin: true,
        instructor: true,
        learner: false,
      },
      {
        name: "View personal progress",
        admin: true,
        instructor: true,
        learner: true,
      },
    ],
  },
  {
    category: "Content Access",
    icon: Eye,
    permissions: [
      {
        name: "Access all courses",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "Enroll in courses",
        admin: false,
        instructor: false,
        learner: true,
      },
      { name: "Take quizzes", admin: false, instructor: false, learner: true },
    ],
  },
  {
    category: "System",
    icon: Settings,
    permissions: [
      { name: "Site settings", admin: true, instructor: false, learner: false },
      { name: "Audit logs", admin: true, instructor: false, learner: false },
      {
        name: "Email settings",
        admin: true,
        instructor: false,
        learner: false,
      },
    ],
  },
  {
    category: "Payments",
    icon: CreditCard,
    permissions: [
      {
        name: "View all payments",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "Manage pricing",
        admin: true,
        instructor: false,
        learner: false,
      },
      {
        name: "View own earnings",
        admin: true,
        instructor: true,
        learner: false,
      },
    ],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Roles & Permissions</h2>
        <p className="text-muted-foreground">
          Manage access control and role-based permissions.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <Badge variant={role.badgeVariant}>{role.name}</Badge>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <h4 className="text-sm font-semibold mb-2">Key Permissions</h4>
              <ul className="space-y-1.5">
                {role.permissions.map((perm) => (
                  <li
                    key={perm}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Permission Matrix
          </CardTitle>
          <CardDescription>
            Detailed breakdown of permissions by role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Permission</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Instructor</TableHead>
                  <TableHead className="text-center">Learner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionMatrix.map((group) => (
                  <>
                    <TableRow key={group.category} className="bg-muted/50">
                      <TableCell colSpan={4} className="font-semibold">
                        <div className="flex items-center gap-2">
                          <group.icon className="h-4 w-4" />
                          {group.category}
                        </div>
                      </TableCell>
                    </TableRow>
                    {group.permissions.map((perm) => (
                      <TableRow key={perm.name}>
                        <TableCell className="pl-8 text-sm">
                          {perm.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.admin ? (
                            <Badge variant="default" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.instructor ? (
                            <Badge variant="default" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.learner ? (
                            <Badge variant="default" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
