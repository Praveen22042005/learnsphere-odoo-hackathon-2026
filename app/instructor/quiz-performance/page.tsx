"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, BarChart3, CircleHelp } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportData {
  quizPerformance: {
    totalAttempts: number;
    passRate: number;
    averageScore: number;
  };
}

export default function InstructorQuizPerformancePage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/instructor/reports");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        toast.error("Failed to load quiz performance");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quiz Performance</h1>
        <p className="text-sm text-muted-foreground">
          Analyze how learners perform on your quizzes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </CardTitle>
            <CircleHelp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.quizPerformance.totalAttempts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {data.quizPerformance.passRate}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.quizPerformance.averageScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Insights</CardTitle>
          <CardDescription>
            Tips to improve your quiz engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {data.quizPerformance.passRate < 50 && (
            <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
              ⚠️ Your pass rate is below 50%. Consider reviewing question
              difficulty or adding more study materials before quizzes.
            </div>
          )}
          {data.quizPerformance.totalAttempts === 0 && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              💡 No quiz attempts yet. Make sure your courses are published and
              quizzes are accessible to learners.
            </div>
          )}
          {data.quizPerformance.passRate >= 80 && (
            <div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300">
              🎉 Great job! Your pass rate is above 80%. Learners are performing
              well on your quizzes.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
