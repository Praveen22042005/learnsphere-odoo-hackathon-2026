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
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Clock,
  BarChart3,
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
  ResponsiveContainer,
  Bar,
  BarChart,
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
  summary: {
    totalEnrollments30d: number;
    totalCompletions30d: number;
    quizPassRate: number;
    avgProgress: number;
    totalLearningHours: number;
    totalQuizAttempts30d: number;
  };
}

const completionChartConfig = {
  completions: {
    label: "Completions",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const courseBarConfig = {
  enrollment_count: {
    label: "Enrollments",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function AdminCompletionsPage() {
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
          <h2 className="font-heading text-2xl font-bold">
            Completion Analytics
          </h2>
          <p className="text-muted-foreground">
            Course completion and learner performance.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const completionRate =
    summary && summary.totalEnrollments30d > 0
      ? Math.round(
          (summary.totalCompletions30d / summary.totalEnrollments30d) * 100,
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">
          Completion Analytics
        </h2>
        <p className="text-muted-foreground">
          Track course completion rates and learner performance metrics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completions (30d)
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalCompletions30d ?? 0}
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
            <Progress value={summary?.avgProgress ?? 0} className="mt-2" />
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
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Completion Trend (30 Days)
          </CardTitle>
          <CardDescription>
            Daily course completions over the last month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={completionChartConfig}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.enrollmentTrend || []}>
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
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="var(--color-completions)"
                  fill="var(--color-completions)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Two column: Quiz Performance + Top Courses */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quiz Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quiz Performance
            </CardTitle>
            <CardDescription>Pass rate and attempt statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Quiz Pass Rate</span>
                  <span className="text-sm font-bold">
                    {summary?.quizPassRate ?? 0}%
                  </span>
                </div>
                <Progress value={summary?.quizPassRate ?? 0} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">
                    {summary?.totalQuizAttempts30d ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quiz Attempts (30d)
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">
                    {summary?.avgProgress ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg Learner Progress
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Most Enrolled Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topCourses && data.topCourses.length > 0 ? (
              <ChartContainer
                config={courseBarConfig}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topCourses.slice(0, 5)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="title"
                      fontSize={11}
                      width={120}
                      tickFormatter={(t) =>
                        t.length > 18 ? t.slice(0, 18) + "…" : t
                      }
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="enrollment_count"
                      fill="var(--color-enrollment_count)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
