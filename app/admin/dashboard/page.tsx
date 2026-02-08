"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Activity,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalRevenue: number;
  totalInstructors: number;
  totalLearners: number;
  totalQuizAttempts: number;
}

interface DashboardData {
  stats: DashboardStats;
  enrollmentTrend: Array<{ date: string; enrollments: number }>;
  userDistribution: Array<{ role: string; count: number; fill: string }>;
  recentUsers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
  }>;
  recentCourses: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
}

const enrollmentChartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  learners: {
    label: "Learners",
    color: "hsl(var(--chart-1))",
  },
  instructors: {
    label: "Instructors",
    color: "hsl(var(--chart-2))",
  },
  admins: {
    label: "Admins",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Platform overview and insights.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Platform overview and real-time insights.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses ?? 0}</div>
            <p className="text-xs text-muted-foreground">Published courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Course pricing total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCompletions ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Enrollment Trend Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Enrollment Trend
            </CardTitle>
            <CardDescription>
              New enrollments over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={enrollmentChartConfig}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.enrollmentTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    }
                    fontSize={12}
                  />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="var(--color-enrollments)"
                    fill="var(--color-enrollments)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Distribution Pie */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={data?.userDistribution || []}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ role, count }) => `${role}: ${count}`}
                  >
                    {(data?.userDistribution || []).map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Users
            </CardTitle>
            <CardDescription>Latest users who joined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentUsers && data.recentUsers.length > 0 ? (
                data.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url || ""} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {u.role}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent users
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Manage Users</p>
                  <p className="text-xs text-muted-foreground">
                    View & manage accounts
                  </p>
                </div>
              </a>
              <a
                href="/admin/courses"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">All Courses</p>
                  <p className="text-xs text-muted-foreground">
                    Review & manage courses
                  </p>
                </div>
              </a>
              <a
                href="/admin/roles"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Roles & Permissions</p>
                  <p className="text-xs text-muted-foreground">
                    Manage access control
                  </p>
                </div>
              </a>
              <a
                href="/admin/reports"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Reports</p>
                  <p className="text-xs text-muted-foreground">
                    View analytics
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
