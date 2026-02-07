/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  CircleHelp,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface QuizInfo {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  questions_count: number;
  course_title?: string;
}

export default function LearnerQuizzesPage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
   
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
   
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
   
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        // Get enrolled courses first
        const enrollRes = await fetch("/api/learner/courses?enrolled=true");
        if (!enrollRes.ok) {
          console.error("Failed to fetch enrollments:", enrollRes.status);
          throw new Error("Failed to fetch enrolled courses");
        }
        const enrollData = await enrollRes.json();
        const enrollments = enrollData.enrollments || [];

        console.log("Enrolled courses:", enrollments.length);

        const allQuizzes: QuizInfo[] = [];
        for (const enrollment of enrollments) {
          const courseId = enrollment.course?.id || enrollment.course_id;
          const courseTitle = enrollment.course?.title || "Unknown Course";

          if (!courseId) {
            console.warn("Enrollment missing course ID:", enrollment);
            continue;
          }

          try {
            const qRes = await fetch(`/api/courses/${courseId}/quizzes`);
            if (qRes.ok) {
              const qData = await qRes.json();
              console.log(
                `Quizzes for ${courseTitle}:`,
                qData.quizzes?.length || 0,
              );
              const quizzesWithCourse = (qData.quizzes || []).map(
                (q: QuizInfo) => ({
                  ...q,
                  course_title: courseTitle,
                }),
              );
              allQuizzes.push(...quizzesWithCourse);
            } else {
              console.error(
                `Failed to fetch quizzes for course ${courseId}:`,
                qRes.status,
              );
            }
          } catch (err) {
            console.error(
              `Error fetching quizzes for course ${courseId}:`,
              err,
            );
          }
        }

        console.log("Total quizzes found:", allQuizzes.length);
        setQuizzes(allQuizzes);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
        toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const startQuiz = async (quiz: QuizInfo) => {
    try {
      const res = await fetch(
        `/api/courses/${quiz.course_id}/quizzes/${quiz.id}`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuestions(data.questions || []);
      setActiveQuiz(quiz);
      setAnswers({});
      setResult(null);
    } catch {
      toast.error("Failed to load quiz questions");
    }
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/learner/quizzes/${activeQuiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit");
      }

      const data = await res.json();
      setResult(data);
      toast.success(data.passed ? "Quiz passed!" : "Quiz completed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show result screen
  if (result) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            {result.passed ? (
              <Trophy className="h-16 w-16 text-amber-500 mx-auto" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
            )}
            <h2 className="text-2xl font-bold">
              {result.passed ? "Congratulations!" : "Keep Trying!"}
            </h2>
            <p className="text-muted-foreground">
              You scored {result.score}% ({result.correctCount}/
              {result.totalQuestions} correct)
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge
                variant={result.passed ? "default" : "destructive"}
                className="text-sm"
              >
                {result.passed ? "PASSED" : "NOT PASSED"}
              </Badge>
              {result.pointsEarned > 0 && (
                <Badge variant="secondary" className="text-sm">
                  +{result.pointsEarned} points
                </Badge>
              )}
            </div>

            {/* Question results */}
            <div className="text-left mt-6 space-y-2">
              {questions.map((q: any, idx: number) => {
                const qResult = result.questionResults?.[q.id];
                return (
                  <div
                    key={q.id}
                    className={`flex items-start gap-2 p-2 rounded text-sm ${
                      qResult?.correct
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {qResult?.correct ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">
                        Q{idx + 1}: {q.question_text}
                      </p>
                      {!qResult?.correct && (
                        <p className="text-xs text-muted-foreground">
                          Correct answer: {qResult?.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setActiveQuiz(null);
                  // Optionally refetch quizzes to show updated status
                  window.location.reload();
                }}
              >
                Back to Quizzes
              </Button>
              <Button onClick={() => startQuiz(activeQuiz)}>Retry Quiz</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show quiz-taking interface
  if (activeQuiz && questions.length > 0) {
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold">
              {activeQuiz.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {answeredCount}/{questions.length} answered · Passing score:{" "}
              {activeQuiz.passing_score}%
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveQuiz(null)}>
            Cancel
          </Button>
        </div>

        <Progress
          value={(answeredCount / questions.length) * 100}
          className="h-1.5"
        />

        <div className="space-y-4">
          {questions.map((q: any, idx: number) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Question {idx + 1} of {questions.length}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({q.points} pts)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{q.question_text}</p>

                {q.question_type === "multiple_choice" && q.options && (
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: val }))
                    }
                  >
                    {q.options.map((opt: any) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={opt.value}
                          id={`${q.id}-${opt.value}`}
                        />
                        <Label
                          htmlFor={`${q.id}-${opt.value}`}
                          className="cursor-pointer"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {q.question_type === "true_false" && (
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: val }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`${q.id}-true`} />
                      <Label
                        htmlFor={`${q.id}-true`}
                        className="cursor-pointer"
                      >
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`${q.id}-false`} />
                      <Label
                        htmlFor={`${q.id}-false`}
                        className="cursor-pointer"
                      >
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {q.question_type === "short_answer" && (
                  <Input
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer..."
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={submitQuiz}
          disabled={submitting || answeredCount < questions.length}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Submit Quiz ({answeredCount}/{questions.length})
        </Button>
      </div>
    );
  }

  // Show quiz list
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Quizzes</h2>
        <p className="text-muted-foreground">
          Test your knowledge and earn points.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="py-16 text-center">
          <CircleHelp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No quizzes available yet.</p>
          <p className="text-sm text-muted-foreground">
            Enroll in courses to access their quizzes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-semibold">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.course_title}
                    </p>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>{quiz.questions_count} questions</span>
                      <span>Pass: {quiz.passing_score}%</span>
                      {quiz.time_limit_minutes && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />{" "}
                          {quiz.time_limit_minutes}m
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startQuiz(quiz)}
                    className="shrink-0 gap-1"
                  >
                    Start <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
