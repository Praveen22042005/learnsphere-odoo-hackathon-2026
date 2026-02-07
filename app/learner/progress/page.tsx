"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnrollmentProgress {
  id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  time_spent_minutes: number;
  enrolled_at: string;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    category: string | null;
    difficulty_level: string | null;
  };
}

export default function LearnerProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentProgress[]>([]);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch("/api/learner/courses?enrolled=true");
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.enrollments || []);
        }
      } catch {
        toast.error("Failed to load progress");
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "completed",
  ).length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          enrollments.reduce((s, e) => s + (e.progress_percentage || 0), 0) /
            totalCourses,
        )
      : 0;
  const totalTime = enrollments.reduce(
    (s, e) => s + (e.time_spent_minutes || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Progress Tracker</h2>
        <p className="text-muted-foreground">
          Monitor your learning journey across all courses.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {completedCourses} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {totalCourses > 0
                ? `${Math.round((completedCourses / totalCourses) * 100)}% completion rate`
                : "No courses yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTime >= 60
                ? `${Math.floor(totalTime / 60)}h`
                : `${totalTime}m`}
            </div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-course progress */}
      {enrollments.length === 0 ? (
        <div className="py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No courses to track yet.</p>
          <Button variant="link" onClick={() => router.push("/learner/browse")}>
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Course Progress</h3>
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                router.push(
                  `/learner/courses/${enrollment.course?.id || enrollment.course_id}`,
                )
              }
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {enrollment.course?.title || "Course"}
                    </p>
                    {enrollment.status === "completed" && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0"
                      >
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {enrollment.course?.category && (
                      <span>{enrollment.course.category}</span>
                    )}
                    {enrollment.time_spent_minutes > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {enrollment.time_spent_minutes >= 60
                          ? `${Math.floor(enrollment.time_spent_minutes / 60)}h ${enrollment.time_spent_minutes % 60}m`
                          : `${enrollment.time_spent_minutes}m`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-32 shrink-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {enrollment.progress_percentage || 0}%
                    </span>
                  </div>
                  <Progress
                    value={enrollment.progress_percentage || 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
