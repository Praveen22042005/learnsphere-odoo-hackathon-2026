"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Compass,
  Star,
  Users,
  Clock,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrowseCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  difficulty_level: string | null;
  estimated_duration_hours: number | null;
  is_free: boolean;
  price: number;
  enrollment_count: number;
  average_rating: number;
  tags: string[] | null;
}

export default function LearnerBrowsePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<BrowseCourse[]>([]);
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/learner/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
          setEnrollmentMap(data.enrollmentMap || {});
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      const res = await fetch(`/api/learner/courses/${courseId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enroll");
      }
      setEnrollmentMap((prev) => ({ ...prev, [courseId]: "active" }));
      toast.success("Successfully enrolled!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "all" || c.category === category;
    const matchesDifficulty =
      difficulty === "all" || c.difficulty_level === difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];

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
        <h1 className="text-2xl font-bold">Browse Courses</h1>
        <p className="text-sm text-muted-foreground">
          Discover courses and start learning
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-8"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat!} value={cat!}>
                {cat!.charAt(0).toUpperCase() + cat!.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Compass className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No courses found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const enrollStatus = enrollmentMap[course.id];
            return (
              <div
                key={course.id}
                className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col"
                onClick={() => router.push(`/learner/courses/${course.id}`)}
              >
                <div className="h-40 relative overflow-hidden bg-muted">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {course.is_free && (
                    <Badge className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px]">
                      FREE
                    </Badge>
                  )}
                  {course.difficulty_level && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-[10px]"
                    >
                      {course.difficulty_level}
                    </Badge>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold line-clamp-1 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {course.description || "No description"}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    {course.average_rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {course.average_rating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      {course.enrollment_count}
                    </span>
                    {course.estimated_duration_hours && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {course.estimated_duration_hours}h
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    {enrollStatus === "active" ||
                    enrollStatus === "completed" ? (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/learner/courses/${course.id}`);
                        }}
                      >
                        {enrollStatus === "completed"
                          ? "View Course"
                          : "Continue Learning"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={enrolling === course.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course.id);
                        }}
                      >
                        {enrolling === course.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : null}
                        {course.is_free
                          ? "Enroll Free"
                          : `Enroll - $${course.price}`}
                      </Button>
                    )}
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
