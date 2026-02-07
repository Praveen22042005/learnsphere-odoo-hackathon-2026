/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function LearnerContinuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await fetch("/api/learner/courses?enrolled=true");
        if (res.ok) {
          const data = await res.json();
          // Filter to active (in-progress) courses only
          const active = (data.enrollments || []).filter(
            (e: any) =>
              e.status === "active" && (e.progress_percentage || 0) > 0,
          );
          setEnrollments(active);
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetchActive();
  }, []);

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
        <h2 className="font-heading text-2xl font-bold">Continue Learning</h2>
        <p className="text-muted-foreground">Pick up where you left off.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No courses in progress.</p>
          <p className="text-sm text-muted-foreground">
            Start a course and your progress will appear here.
          </p>
          <Button
            variant="link"
            onClick={() => router.push("/learner/browse")}
            className="mt-2"
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment: any) => {
            const course = enrollment.course;
            return (
              <Card
                key={enrollment.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  router.push(
                    `/learner/courses/${course?.id || enrollment.course_id}`,
                  )
                }
              >
                <CardContent className="flex items-center gap-4 py-4">
                  {course?.thumbnail_url ? (
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title || ""}
                        width={96}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-24 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {course?.title || "Course"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {course?.category && (
                        <Badge variant="secondary" className="text-[10px]">
                          {course.category}
                        </Badge>
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
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {enrollment.progress_percentage || 0}%
                        </span>
                      </div>
                      <Progress
                        value={enrollment.progress_percentage || 0}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0 gap-1">
                    <Play className="h-3.5 w-3.5" /> Continue
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
