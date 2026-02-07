"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Award,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EnrolledCourse {
  id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  time_spent_minutes: number;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    description: string | null;
    tags: string[] | null;
    status: string;
    is_free: boolean;
    price: number;
    difficulty_level: string | null;
    category: string | null;
    estimated_duration: number | null;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/learner/courses?enrolled=true");
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.enrollments || []);
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const completedCount = enrollments.filter(
    (e) => e.status === "completed",
  ).length;
  const totalTime = enrollments.reduce(
    (s, e) => s + (e.time_spent_minutes || 0),
    0,
  );

  const filtered = enrollments.filter((e) => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">My Courses</h2>
        <p className="text-muted-foreground">
          Track your learning progress and continue where you left off.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">Total courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTime >= 60
                ? `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`
                : `${totalTime}m`}
            </div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
            {f === "all" && ` (${enrollments.length})`}
            {f === "active" && ` (${activeCount})`}
            {f === "completed" && ` (${completedCount})`}
          </Button>
        ))}
      </div>

      {/* Course cards */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {filter === "all"
                ? "No enrolled courses yet"
                : `No ${filter} courses`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Browse the course catalog to get started
            </p>
            <Button onClick={() => router.push("/learner/browse")}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            return (
              <div
                key={enrollment.id}
                className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col"
                onClick={() =>
                  router.push(`/learner/courses/${enrollment.course_id}`)
                }
              >
                <div className="h-36 relative overflow-hidden bg-muted">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {enrollment.status === "completed" && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-emerald-600 text-white gap-1 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                  )}
                  {course.difficulty_level && (
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize backdrop-blur-sm bg-background/80"
                      >
                        {course.difficulty_level}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold line-clamp-1">
                      {course.title}
                    </h3>
                    {course.is_free && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        Free
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {course.description || "No description"}
                  </p>

                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{enrollment.progress_percentage || 0}%</span>
                      </div>
                      <Progress
                        value={enrollment.progress_percentage || 0}
                        className="h-2"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      {course.category && <span>{course.category}</span>}
                      {enrollment.time_spent_minutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {enrollment.time_spent_minutes >= 60
                            ? `${Math.floor(enrollment.time_spent_minutes / 60)}h ${enrollment.time_spent_minutes % 60}m`
                            : `${enrollment.time_spent_minutes}m`}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full gap-1.5"
                      variant={
                        enrollment.progress_percentage > 0
                          ? "default"
                          : "outline"
                      }
                    >
                      <Play className="h-3 w-3" />
                      {enrollment.progress_percentage === 100
                        ? "Review Course"
                        : enrollment.progress_percentage > 0
                          ? "Continue Learning"
                          : "Start Course"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
