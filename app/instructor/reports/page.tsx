"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Users,
  BookOpen,
  TrendingUp,
  Star,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ReportData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    averageCompletion: number;
    averageRating: number;
  };
  coursePerformance: {
    courseId: string;
    title: string;
    enrollments: number;
    completions: number;
    completionRate: number;
    averageProgress: number;
    rating: number;
  }[];
  quizPerformance: {
    totalAttempts: number;
    passRate: number;
    averageScore: number;
  };
  recentEnrollments: {
    id: string;
    created_at: string;
    progress_percentage: number;
    status: string;
    learner: {
      first_name: string | null;
      last_name: string | null;
      email: string;
    };
  }[];
}

export default function InstructorReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/instructor/reports");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
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
        <h1 className="text-2xl font-bold">Course Reports</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your courses performance and learner engagement
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalStudents}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalCourses}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Completion
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.averageCompletion}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.averageRating}/5
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {data.quizPerformance.totalAttempts}
              </div>
              <p className="text-xs text-muted-foreground">Total Attempts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {data.quizPerformance.passRate}%
              </div>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {data.quizPerformance.averageScore}%
              </div>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Performance</CardTitle>
          <CardDescription>Detailed breakdown by course</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Completions</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Avg Progress</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.coursePerformance.map((cp) => (
                <TableRow key={cp.courseId}>
                  <TableCell className="font-medium">{cp.title}</TableCell>
                  <TableCell>{cp.enrollments}</TableCell>
                  <TableCell>{cp.completions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={cp.completionRate}
                        className="h-2 w-16"
                      />
                      <span className="text-xs">{cp.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={cp.averageProgress}
                        className="h-2 w-16"
                      />
                      <span className="text-xs">{cp.averageProgress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{cp.rating || "-"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Enrollments</CardTitle>
          <CardDescription>
            Latest learners who joined your courses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentEnrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {e.learner?.first_name || ""}{" "}
                        {e.learner?.last_name || ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.learner?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={e.progress_percentage || 0}
                        className="h-2 w-16"
                      />
                      <span className="text-xs">
                        {e.progress_percentage || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
