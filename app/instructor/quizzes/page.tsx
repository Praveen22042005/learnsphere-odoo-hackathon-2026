"use client";

import { useState, useEffect } from "react";
import { Loader2, CircleHelp, Pencil, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Quiz } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseOption {
  id: string;
  title: string;
}

export default function InstructorQuizzesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
          if (data.courses?.length > 0) {
            setSelectedCourseId(data.courses[0].id);
          }
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    async function fetchQuizzes() {
      setLoadingQuizzes(true);
      try {
        const res = await fetch(`/api/courses/${selectedCourseId}/quizzes`);
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data.quizzes || []);
        }
      } catch {
        toast.error("Failed to load quizzes");
      } finally {
        setLoadingQuizzes(false);
      }
    }
    fetchQuizzes();
  }, [selectedCourseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-sm text-muted-foreground">
            Manage quizzes across all your courses
          </p>
        </div>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadingQuizzes ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CircleHelp className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No quizzes found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create quizzes from the course editor
            </p>
            <Button
              onClick={() =>
                router.push(`/instructor/courses/${selectedCourseId}`)
              }
              className="gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              Open Course Editor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base truncate">
                  {quiz.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <Badge variant="secondary" className="text-[10px]">
                    {quiz.questions_count || 0} questions
                  </Badge>
                  <span>Pass: {quiz.passing_score}%</span>
                  {quiz.time_limit_minutes && (
                    <span>⏱ {quiz.time_limit_minutes}min</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/instructor/courses/${selectedCourseId}`)
                  }
                  className="w-full gap-1.5"
                >
                  <Pencil className="h-3 w-3" />
                  Edit in Course Editor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
