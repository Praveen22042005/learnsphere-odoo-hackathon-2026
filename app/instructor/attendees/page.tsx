"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Attendee {
  id: string;
  status: string;
  progress_percentage: number;
  created_at: string;
  learner: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export default function InstructorAttendeesPage() {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
          if (data.courses?.length > 0) setSelectedCourseId(data.courses[0].id);
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
    async function fetchAttendees() {
      setLoadingAttendees(true);
      try {
        const res = await fetch(`/api/courses/${selectedCourseId}/enrollments`);
        if (res.ok) {
          const data = await res.json();
          setAttendees(data.enrollments || []);
        }
      } catch {
        toast.error("Failed to load attendees");
      } finally {
        setLoadingAttendees(false);
      }
    }
    fetchAttendees();
  }, [selectedCourseId]);

  const filteredAttendees = attendees.filter((a) => {
    const name =
      `${a.learner?.first_name || ""} ${a.learner?.last_name || ""} ${a.learner?.email || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendees</h1>
          <p className="text-sm text-muted-foreground">
            View enrolled learners across your courses
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Attendees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {attendees.filter((a) => a.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.length
                ? Math.round(
                    attendees.reduce(
                      (s, a) => s + (a.progress_percentage || 0),
                      0,
                    ) / attendees.length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search attendees..."
          className="pl-8"
        />
      </div>

      {loadingAttendees ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredAttendees.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No attendees yet</h3>
            <p className="text-sm text-muted-foreground">
              Learners will appear here once they enroll
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
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
              {filteredAttendees.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={a.learner?.avatar_url || ""} />
                        <AvatarFallback>
                          {(
                            a.learner?.first_name?.[0] ||
                            a.learner?.email?.[0] ||
                            "U"
                          ).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {a.learner?.first_name || ""}{" "}
                          {a.learner?.last_name || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.learner?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        a.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : a.status === "active"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-32">
                      <Progress
                        value={a.progress_percentage || 0}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        {a.progress_percentage || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
