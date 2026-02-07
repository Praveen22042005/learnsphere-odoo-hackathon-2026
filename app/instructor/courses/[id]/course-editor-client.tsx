"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Trash2,
  Loader2,
  ImageIcon,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Course, CourseStatus } from "@/types/course";
import type { Lesson } from "@/types/lesson";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LessonsManager } from "./lessons-manager";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Programming",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "DevOps",
  "Design",
  "Business",
  "Marketing",
  "Other",
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function CourseEditorClient({
  initialCourse,
  initialLessons,
}: {
  initialCourse: Course;
  initialLessons: Lesson[];
}) {
  const router = useRouter();

  // ── Course form state ──
  const [course, setCourse] = useState(initialCourse);
  const [title, setTitle] = useState(initialCourse.title);
  const [description, setDescription] = useState(
    initialCourse.description || "",
  );
  const [category, setCategory] = useState(initialCourse.category || "");
  const [difficultyLevel, setDifficultyLevel] = useState(
    initialCourse.difficulty_level || "",
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialCourse.thumbnail_url || "",
  );
  const [estimatedDuration, setEstimatedDuration] = useState(
    initialCourse.estimated_duration_hours?.toString() || "",
  );
  const [isFree, setIsFree] = useState(initialCourse.is_free);
  const [price, setPrice] = useState(initialCourse.price?.toString() || "0");
  const [tags, setTags] = useState<string[]>(initialCourse.tags || []);
  const [tagInput, setTagInput] = useState("");

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

  // ── Save course ──
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category: category || null,
          difficulty_level: difficultyLevel || null,
          thumbnail_url: thumbnailUrl.trim() || null,
          estimated_duration_hours: estimatedDuration
            ? parseInt(estimatedDuration)
            : null,
          is_free: isFree,
          price: isFree ? 0 : parseFloat(price) || 0,
          tags: tags.length > 0 ? tags : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const { course: updated } = await res.json();
      setCourse(updated);
      toast.success("Course saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  }, [
    course.id,
    title,
    description,
    category,
    difficultyLevel,
    thumbnailUrl,
    estimatedDuration,
    isFree,
    price,
    tags,
  ]);

  // ── Publish / Unpublish ──
  const handlePublish = useCallback(async () => {
    const newStatus: CourseStatus =
      course.status === "published" ? "draft" : "published";
    setPublishing(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      const { course: updated } = await res.json();
      setCourse(updated);
      toast.success(
        newStatus === "published" ? "Course published!" : "Course unpublished",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setPublishing(false);
    }
  }, [course.id, course.status]);

  // ── Delete course ──
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Course deleted");
      router.push("/instructor/courses");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete course",
      );
    } finally {
      setDeleting(false);
    }
  }, [course.id, router]);

  // ── Tags ──
  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags((prev) => [...prev, tag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // ── Dirty check ──
  const hasChanges =
    title !== course.title ||
    description !== (course.description || "") ||
    category !== (course.category || "") ||
    difficultyLevel !== (course.difficulty_level || "") ||
    thumbnailUrl !== (course.thumbnail_url || "") ||
    estimatedDuration !== (course.estimated_duration_hours?.toString() || "") ||
    isFree !== course.is_free ||
    price !== (course.price?.toString() || "0") ||
    JSON.stringify(tags) !== JSON.stringify(course.tags || []);

  return (
    <div className="space-y-6">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/instructor/courses")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0">
            <h2 className="truncate font-heading text-lg font-bold">
              {course.title}
            </h2>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-semibold uppercase",
                  statusColor(course.status),
                )}
              >
                {course.status}
              </Badge>
              {hasChanges && (
                <span className="text-xs text-amber-600">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving..." : "Save"}
          </Button>

          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishing}
            variant={course.status === "published" ? "outline" : "default"}
            className="gap-1.5"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : course.status === "published" ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {course.status === "published" ? "Unpublish" : "Publish"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{course.title}&rdquo; and
                  all its lessons. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── Tabbed Editor ────────────────────────────────────────── */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
        </TabsList>

        {/* ── Details Tab ─────────────────────────────────────── */}
        <TabsContent value="details" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column: main info */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                  <CardDescription>
                    Course title, description, and thumbnail
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter course title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what students will learn..."
                      className="min-h-30 resize-y"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail URL</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="thumbnail"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    {thumbnailUrl && (
                      <div className="mt-2 overflow-hidden rounded-lg border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnailUrl}
                          alt="Course thumbnail preview"
                          className="aspect-video w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tags</CardTitle>
                  <CardDescription>
                    Add tags to help learners find your course (max 10)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Type a tag and press Enter"
                        className="pl-8"
                        disabled={tags.length >= 10}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={!tagInput.trim() || tags.length >= 10}
                      className="h-9"
                    >
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select
                      value={difficultyLevel}
                      onValueChange={setDifficultyLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="e.g. 10"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="free-switch">Free Course</Label>
                      <p className="text-xs text-muted-foreground">
                        Make this course free for all learners
                      </p>
                    </div>
                    <Switch
                      id="free-switch"
                      checked={isFree}
                      onCheckedChange={setIsFree}
                    />
                  </div>

                  {!isFree && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Course Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        statusColor(course.status),
                      )}
                    >
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium">{lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrollments</span>
                    <span className="font-medium">
                      {course.enrollment_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium">
                      {course.average_rating > 0
                        ? `${course.average_rating} / 5`
                        : "No ratings"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(course.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Lessons Tab ─────────────────────────────────────── */}
        <TabsContent value="lessons" className="mt-6">
          <LessonsManager
            courseId={course.id}
            lessons={lessons}
            onLessonsChange={setLessons}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
