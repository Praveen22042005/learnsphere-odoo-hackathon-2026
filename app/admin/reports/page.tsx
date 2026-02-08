"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Target,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";

interface AnalyticsData {
  enrollmentTrend: Array<{
    date: string;
    enrollments: number;
    completions: number;
  }>;
  topCourses: Array<{
    id: string;
    title: string;
    category: string;
    enrollment_count: number;
    average_rating: string;
  }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  summary: {
    totalEnrollments30d: number;
    totalCompletions30d: number;
    quizPassRate: number;
    avgProgress: number;
    totalLearningHours: number;
    totalQuizAttempts30d: number;
  };
}

const enrollmentChartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "hsl(var(--chart-1))",
  },
  completions: {
    label: "Completions",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  count: {
    label: "Courses",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AdminReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">
            Platform analytics and insights.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Reports</h2>
        <p className="text-muted-foreground">
          Platform analytics and insights for the last 30 days.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Enrollments (30d)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalEnrollments30d ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completions (30d)
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalCompletions30d ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Quiz Pass Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.quizPassRate ?? 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.avgProgress ?? 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalLearningHours ?? 0}h
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Quiz Attempts (30d)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalQuizAttempts30d ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Enrollment & Completion Trend (30 Days)
          </CardTitle>
          <CardDescription>
            Daily enrollments and course completions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={enrollmentChartConfig}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.enrollmentTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                  fontSize={11}
                  interval={4}
                />
                <YAxis fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="var(--color-enrollments)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="var(--color-completions)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Two columns: Top Courses & Category Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Top Courses by Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topCourses && data.topCourses.length > 0 ? (
                data.topCourses.map((course, i) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {course.category || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {course.enrollment_count} enrolled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ★ {course.average_rating}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No courses yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Course Categories
            </CardTitle>
            <CardDescription>
              Distribution of courses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data?.categoryDistribution &&
            data.categoryDistribution.length > 0 ? (
              <ChartContainer
                config={categoryChartConfig}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      fontSize={11}
                      width={100}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
