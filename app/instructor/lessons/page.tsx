/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Video,
  FileQuestion,
  BookOpen,
  Loader2,
  Edit,
  ExternalLink,
  Clock,
  Filter,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const lessonTypeIcons: Record<string, any> = {
  video: Video,
  text: FileText,
  quiz: FileQuestion,
  assignment: FileText,
  document: FileText,
  image: FileText,
};

const lessonTypeLabels: Record<string, string> = {
  video: "Video",
  text: "Text",
  quiz: "Quiz",
  assignment: "Assignment",
  document: "Document",
  image: "Image",
};

export default function InstructorLessonsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/instructor/lessons");
      if (!response.ok) throw new Error("Failed to fetch lessons");

      const data = await response.json();
      setLessons(data.lessons || []);
      setCourses(data.courses || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesCourse =
      selectedCourse === "all" || lesson.course_id === selectedCourse;
    const matchesSearch =
      searchQuery === "" ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.course?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleEditLesson = (lesson: any) => {
    router.push(
      `/instructor/courses/${lesson.course_id}?tab=content&lessonId=${lesson.id}`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lessons / Content</h1>
          <p className="text-sm text-muted-foreground">
            Manage lesson content from within each course editor
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Create your first course and add lessons to get started. Lessons
              are managed within each course&apos;s Content tab.
            </p>
            <Button
              onClick={() => router.push("/instructor/courses")}
              className="gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              Go to My Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lessons / Content</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all lessons across your courses
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLessons || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.videoLessons || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Text</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.textLessons || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.quizLessons || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.publishedLessons || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No lessons found matching your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLessons.map((lesson) => {
            const Icon = lessonTypeIcons[lesson.lesson_type] || FileText;
            const isPublished = lesson.course?.status === "published";

            return (
              <Card
                key={lesson.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">
                            {lesson.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            {lessonTypeLabels[lesson.lesson_type] ||
                              lesson.lesson_type}
                          </Badge>
                          {isPublished && (
                            <Badge
                              variant="default"
                              className="text-xs shrink-0"
                            >
                              Published
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {lesson.course?.title || "Unknown Course"}
                        </p>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {lesson.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.duration_minutes} min
                            </span>
                          )}
                          <span>Order: {lesson.order_index + 1}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditLesson(lesson)}
                      className="shrink-0"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Action */}
      <Card className="border-dashed">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Want to add or edit lessons? Manage them in the course editor.
          </p>
          <Button
            onClick={() => router.push("/instructor/courses")}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <BookOpen className="h-4 w-4" />
            Go to My Courses
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
