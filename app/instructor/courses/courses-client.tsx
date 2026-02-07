"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Eye,
  Grid3X3,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
  Copy,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { CourseWithStats } from "@/types/course";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function statusColor(status: string) {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
    case "draft":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "archived":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "";
  }
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onShare,
  onEdit,
  onDelete,
  onDuplicate,
  deletingId,
  duplicatingId,
}: {
  course: CourseWithStats;
  onShare: (course: CourseWithStats) => void;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onDuplicate: (course: CourseWithStats) => void;
  deletingId: string | null;
  duplicatingId: string | null;
}) {
  const isDeleting = deletingId === course.id;
  const isDuplicating = duplicatingId === course.id;
  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
            <GraduationCap className="h-12 w-12 text-primary/30" />
          </div>
        )}

        {/* Status badge overlaid */}
        <Badge
          variant="secondary"
          className={cn(
            "absolute left-3 top-3 text-[10px] font-semibold uppercase",
            statusColor(course.status),
          )}
        >
          {course.status}
        </Badge>
      </div>

      <CardHeader className="flex-1 space-y-1.5 p-4 pb-2">
        <CardTitle className="line-clamp-2 text-base leading-snug">
          {course.title}
        </CardTitle>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {course.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] font-normal"
              >
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {course.description && (
          <CardDescription className="line-clamp-2 text-xs">
            {course.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {course.views_count}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.lessons_count}{" "}
            {course.lessons_count === 1 ? "lesson" : "lessons"}
          </span>
          {course.estimated_duration_hours != null &&
            course.estimated_duration_hours > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.estimated_duration_hours}h
              </span>
            )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 flex-1 gap-1.5 text-xs"
            onClick={() => onEdit(course.id)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onShare(course)}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(course.id)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(course)}>
                <Share2 className="mr-2 h-3.5 w-3.5" />
                Share Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDuplicate(course)}
                disabled={isDuplicating}
              >
                {isDuplicating ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Copy className="mr-2 h-3.5 w-3.5" />
                )}
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(course.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Course List Row ──────────────────────────────────────────────────────────

function CourseListRow({
  course,
  onShare,
  onEdit,
  onDelete,
  onDuplicate,
  deletingId,
  duplicatingId,
}: {
  course: CourseWithStats;
  onShare: (course: CourseWithStats) => void;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onDuplicate: (course: CourseWithStats) => void;
  deletingId: string | null;
  duplicatingId: string | null;
}) {
  const isDeleting = deletingId === course.id;
  const isDuplicating = duplicatingId === course.id;
  return (
    <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
            <GraduationCap className="h-6 w-6 text-primary/30" />
          </div>
        )}
      </div>

      {/* Title & Meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{course.title}</h3>
          <Badge
            variant="secondary"
            className={cn(
              "shrink-0 text-[10px] font-semibold uppercase",
              statusColor(course.status),
            )}
          >
            {course.status}
          </Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {course.views_count}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessons_count} lessons
          </span>
          {course.estimated_duration_hours != null &&
            course.estimated_duration_hours > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.estimated_duration_hours}h
              </span>
            )}
          {course.tags && course.tags.length > 0 && (
            <div className="flex gap-1">
              {course.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={() => onEdit(course.id)}
        >
          <Pencil className="h-3 w-3" />
          <span className="hidden md:inline">Edit</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onShare(course)}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(course.id)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(course)}>
              <Share2 className="mr-2 h-3.5 w-3.5" />
              Share Link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicate(course)}
              disabled={isDuplicating}
            >
              {isDuplicating ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Copy className="mr-2 h-3.5 w-3.5" />
              )}
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(course.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-3.5 w-3.5" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No courses yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first course and start sharing your knowledge with learners
        around the world!
      </p>
      <Button className="mt-6 gap-2" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        Create Course
      </Button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="p-4 pb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="flex gap-4">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function CoursesClient({
  initialCourses,
}: {
  initialCourses: CourseWithStats[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (!debouncedSearch.trim()) return courses;
    const q = debouncedSearch.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q)) ||
        c.category?.toLowerCase().includes(q),
    );
  }, [courses, debouncedSearch]);

  // Share handler
  const handleShare = useCallback(async (course: CourseWithStats) => {
    const url = `${window.location.origin}/courses/${course.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Course link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const router = useRouter();

  // Edit handler – navigate to course editor
  const handleEdit = useCallback(
    (courseId: string) => {
      router.push(`/instructor/courses/${courseId}`);
    },
    [router],
  );

  // Delete course handler
  const handleDelete = useCallback(async (courseId: string) => {
    setDeletingId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete course");
      }

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete course",
      );
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  }, []);

  // Duplicate course handler
  const handleDuplicate = useCallback(async (course: CourseWithStats) => {
    setDuplicatingId(course.id);
    try {
      // Create a new draft course with copied title
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${course.title} (Copy)` }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to duplicate course");
      }

      const { course: newCourse } = await res.json();

      // Copy over additional fields from the original course
      const patchBody: Record<string, unknown> = {};
      if (course.description) patchBody.description = course.description;
      if (course.category) patchBody.category = course.category;
      if (course.tags?.length) patchBody.tags = course.tags;
      if (course.difficulty_level)
        patchBody.difficulty_level = course.difficulty_level;
      if (course.estimated_duration_hours)
        patchBody.estimated_duration_hours = course.estimated_duration_hours;
      if (course.thumbnail_url) patchBody.thumbnail_url = course.thumbnail_url;
      if (course.is_free !== undefined) patchBody.is_free = course.is_free;
      if (course.price) patchBody.price = course.price;

      if (Object.keys(patchBody).length > 0) {
        await fetch(`/api/courses/${newCourse.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        });
      }

      // Add to list with merged fields
      const duplicated: CourseWithStats = {
        ...newCourse,
        ...patchBody,
        status: "draft",
        lessons_count: 0,
        views_count: 0,
      };
      setCourses((prev) => [duplicated, ...prev]);
      toast.success("Course duplicated! You can find it as a draft.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to duplicate course",
      );
    } finally {
      setDuplicatingId(null);
    }
  }, []);

  // Course being deleted (for confirmation dialog)
  const courseToDelete = courses.find((c) => c.id === deleteConfirmId);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">My Courses</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} {courses.length === 1 ? "course" : "courses"} total
          </p>
        </div>

        <Button
          className="gap-2 shadow-sm"
          onClick={() => router.push("/instructor/create")}
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* ── Toolbar (search + view toggle) ─────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "kanban" | "list")}
          className="w-auto"
        >
          <TabsList className="h-9">
            <TabsTrigger value="kanban" className="gap-1.5 px-3 text-xs">
              <Grid3X3 className="h-3.5 w-3.5" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5 px-3 text-xs">
              <List className="h-3.5 w-3.5" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── Content ── */}
      {courses.length === 0 ? (
        <EmptyState onCreateClick={() => router.push("/instructor/create")} />
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-16 text-center">
          <Search className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No courses match &ldquo;{debouncedSearch}&rdquo;
          </p>
        </div>
      ) : view === "kanban" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onShare={handleShare}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onDuplicate={handleDuplicate}
              deletingId={deletingId}
              duplicatingId={duplicatingId}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCourses.map((course) => (
            <CourseListRow
              key={course.id}
              course={course}
              onShare={handleShare}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onDuplicate={handleDuplicate}
              deletingId={deletingId}
              duplicatingId={duplicatingId}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{courseToDelete?.title}&rdquo;
              and all its lessons. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
