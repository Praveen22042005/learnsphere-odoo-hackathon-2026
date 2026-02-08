"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, DollarSign, TrendingUp, BookOpen } from "lucide-react";

interface CoursePaymentData {
  id: string;
  title: string;
  price: number;
  enrollment_count: number;
  status: string;
  instructor: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function AdminPaymentsPage() {
  const [courses, setCourses] = useState<CoursePaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCourses: 0,
    freeCourses: 0,
    avgPrice: 0,
  });

  useEffect(() => {
    fetch("/api/admin/courses?limit=100")
      .then((res) => res.json())
      .then((data) => {
        const all = data.courses || [];
        setCourses(all);
        const paid = all.filter((c: CoursePaymentData) => c.price > 0);
        const free = all.filter((c: CoursePaymentData) => c.price === 0);
        const totalRevenue = paid.reduce(
          (sum: number, c: CoursePaymentData) =>
            sum + c.price * c.enrollment_count,
          0,
        );
        const avgPrice =
          paid.length > 0
            ? Math.round(
                paid.reduce(
                  (sum: number, c: CoursePaymentData) => sum + c.price,
                  0,
                ) / paid.length,
              )
            : 0;
        setStats({
          totalRevenue,
          paidCourses: paid.length,
          freeCourses: free.length,
          avgPrice,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Payments</h2>
        <p className="text-muted-foreground">
          Revenue overview and course payment tracking.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Price × enrollments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Courses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Free Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgPrice}</div>
          </CardContent>
        </Card>
      </div>

      {/* Paid Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Course Revenue Breakdown
          </CardTitle>
          <CardDescription>
            Revenue per course based on price × enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Enrollments</TableHead>
                    <TableHead className="text-right">Est. Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses
                    .filter((c) => c.price > 0)
                    .sort(
                      (a, b) =>
                        b.price * b.enrollment_count -
                        a.price * a.enrollment_count,
                    )
                    .map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {course.title}
                        </TableCell>
                        <TableCell>
                          {course.instructor
                            ? `${course.instructor.first_name} ${course.instructor.last_name}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.status === "published"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ${course.price}
                        </TableCell>
                        <TableCell className="text-right">
                          {course.enrollment_count}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${course.price * course.enrollment_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  {courses.filter((c) => c.price > 0).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No paid courses yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
