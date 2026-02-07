"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  FileText,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function InstructorDashboardPage() {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/instructor/reports");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const overview = data?.overview || {
    totalStudents: 0,
    totalCourses: 0,
    averageCompletion: 0,
    averageRating: 0,
  };
  const quizPerf = data?.quizPerformance || {
    totalAttempts: 0,
    passRate: 0,
    averageScore: 0,
  };
  const topCourses = (data?.coursePerformance || []).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Instructor Panel</h2>
        <p className="text-muted-foreground">
          Manage your courses, track learner progress, and create engaging
          content.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  My Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.totalCourses}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total courses created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Learners
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrolled learners
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Completion
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.averageCompletion}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Rating
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.averageRating}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Course satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Courses
                </CardTitle>
                <CardDescription>Your best-performing courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topCourses.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      No course data yet
                    </p>
                  </div>
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  topCourses.map((cp: any) => (
                    <div key={cp.courseId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-50">
                          {cp.title}
                        </span>
                        <span className="text-muted-foreground">
                          {cp.enrollments} enrolled
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={cp.completionRate}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {cp.completionRate}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quiz Performance
                </CardTitle>
                <CardDescription>Learner quiz results overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {quizPerf.totalAttempts}
                    </div>
                    <p className="text-xs text-muted-foreground">Attempts</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {quizPerf.passRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {quizPerf.averageScore}%
                    </div>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <a
                  href="/instructor/create"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <PlusCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Create Course</p>
                    <p className="text-xs text-muted-foreground">
                      Start a new course
                    </p>
                  </div>
                </a>
                <a
                  href="/instructor/lessons"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Manage Content</p>
                    <p className="text-xs text-muted-foreground">
                      Edit lessons & quizzes
                    </p>
                  </div>
                </a>
                <a
                  href="/instructor/attendees"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">View Attendees</p>
                    <p className="text-xs text-muted-foreground">
                      See enrolled learners
                    </p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
