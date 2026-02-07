"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Monitor,
  CheckCircle2,
  Video,
  FileText,
  CircleHelp,
  ClipboardList,
  FileDown,
  ImageIcon,
  Clock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function lessonIcon(type: string) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "text":
      return <FileText className="h-4 w-4" />;
    case "quiz":
      return <CircleHelp className="h-4 w-4" />;
    case "assignment":
      return <ClipboardList className="h-4 w-4" />;
    case "document":
      return <FileDown className="h-4 w-4" />;
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

interface LessonItem {
  id: string;
  title: string;
  lesson_type: string;
  duration_minutes: number | null;
  courseId: string;
  courseTitle: string;
  isCompleted: boolean;
}

export default function LearnerLessonsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonItem[]>([]);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const enrollRes = await fetch("/api/learner/courses?enrolled=true");
        if (!enrollRes.ok) throw new Error();
        const enrollData = await enrollRes.json();
        const enrollments = enrollData.enrollments || [];

        const allLessons: LessonItem[] = [];
        for (const enrollment of enrollments) {
          const courseId = enrollment.course?.id || enrollment.course_id;
          const courseTitle = enrollment.course?.title || "Unknown Course";

          try {
            const courseRes = await fetch(`/api/learner/courses/${courseId}`);
            if (courseRes.ok) {
              const courseData = await courseRes.json();
              const lessonProgress = courseData.lessonProgress || {};
              for (const lesson of courseData.lessons || []) {
                allLessons.push({
                  id: lesson.id,
                  title: lesson.title,
                  lesson_type: lesson.lesson_type,
                  duration_minutes: lesson.duration_minutes,
                  courseId,
                  courseTitle,
                  isCompleted: !!lessonProgress[lesson.id],
                });
              }
            }
          } catch {
            // Skip courses that fail
          }
        }

        setLessons(allLessons);
      } catch {
        toast.error("Failed to load lessons");
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const incompleteLessons = lessons.filter((l) => !l.isCompleted);
  const completedLessons = lessons.filter((l) => l.isCompleted);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Lessons</h2>
        <p className="text-muted-foreground">
          All lessons from your enrolled courses.
          {lessons.length > 0 && (
            <>
              {" "}
              {completedLessons.length}/{lessons.length} completed.
            </>
          )}
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="py-16 text-center">
          <Monitor className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No lessons yet.</p>
          <Button variant="link" onClick={() => router.push("/learner/browse")}>
            Browse Courses
          </Button>
        </div>
      ) : (
        <>
          {/* Incomplete lessons */}
          {incompleteLessons.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                To Do ({incompleteLessons.length})
              </h3>
              {incompleteLessons.map((lesson) => (
                <Card
                  key={`${lesson.courseId}-${lesson.id}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    router.push(
                      `/learner/courses/${lesson.courseId}/lessons/${lesson.id}`,
                    )
                  }
                >
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {lessonIcon(lesson.lesson_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lesson.courseTitle}
                      </p>
                    </div>
                    {lesson.duration_minutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                        <Clock className="h-3 w-3" /> {lesson.duration_minutes}m
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed lessons */}
          {completedLessons.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Completed ({completedLessons.length})
              </h3>
              {completedLessons.map((lesson) => (
                <Card
                  key={`${lesson.courseId}-${lesson.id}`}
                  className="cursor-pointer hover:shadow-sm transition-shadow opacity-70"
                  onClick={() =>
                    router.push(
                      `/learner/courses/${lesson.courseId}/lessons/${lesson.id}`,
                    )
                  }
                >
                  <CardContent className="flex items-center gap-3 py-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lesson.courseTitle}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-100 text-emerald-700 shrink-0"
                    >
                      Done
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
