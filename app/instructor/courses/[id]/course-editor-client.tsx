"use client";

import { useState, useCallback, useEffect } from "react";
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
  BookOpen,
  FileText,
  Settings2,
  CircleHelp,
  Plus,
  Pencil,
  Trophy,
  Users,
  Lock,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

import type {
  Course,
  CourseStatus,
  CourseVisibility,
  CourseAccessType,
} from "@/types/course";
import type { Lesson } from "@/types/lesson";
import type { Quiz } from "@/types/quiz";
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
import { QuizBuilder } from "./quiz-builder";

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

  // ── Options state ──
  const [visibility, setVisibility] = useState<CourseVisibility>(
    initialCourse.visibility || "everyone",
  );
  const [accessType, setAccessType] = useState<CourseAccessType>(
    initialCourse.access_type || "open",
  );

  // ── Quiz state ──
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

  // ── Fetch quizzes ──
  const fetchQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/quizzes`);
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoadingQuizzes(false);
    }
  }, [course.id]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

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
          visibility,
          access_type: accessType,
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
    visibility,
    accessType,
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

  // ── Create quiz ──
  const handleCreateQuiz = useCallback(async () => {
    console.log("🎯 handleCreateQuiz called!");
    try {
      console.log(
        "📡 Sending POST request to:",
        `/api/courses/${course.id}/quizzes`,
      );
      const res = await fetch(`/api/courses/${course.id}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Quiz ${quizzes.length + 1}`,
          description: "",
          passing_score: 70,
        }),
      });

      console.log("📥 Response status:", res.status);
      if (!res.ok) throw new Error("Failed to create quiz");
      const data = await res.json();
      console.log("✅ Quiz created:", data.quiz);
      setQuizzes((prev) => [...prev, data.quiz]);
      setSelectedQuizId(data.quiz.id);
      toast.success("Quiz created!");
    } catch (error) {
      console.error("❌ Quiz creation error:", error);
      toast.error("Failed to create quiz");
    }
  }, [course.id, quizzes.length]);

  // ── Delete quiz ──
  const handleDeleteQuiz = useCallback(
    async (quizId: string) => {
      try {
        const res = await fetch(`/api/courses/${course.id}/quizzes/${quizId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete quiz");
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        if (selectedQuizId === quizId) setSelectedQuizId(null);
        toast.success("Quiz deleted");
      } catch {
        toast.error("Failed to delete quiz");
      }
    },
    [course.id, selectedQuizId],
  );

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
    visibility !== (course.visibility || "everyone") ||
    accessType !== (course.access_type || "open") ||
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

      {/* ── Tabbed Editor ── 4 Tabs ────────────────────────────── */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Content
          </TabsTrigger>
          <TabsTrigger value="description" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Description
          </TabsTrigger>
          <TabsTrigger value="options" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Options
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5">
            <CircleHelp className="h-3.5 w-3.5" />
            Quiz ({quizzes.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Content Tab (Lessons) ───────────────────────────── */}
        <TabsContent value="content" className="mt-6">
          <LessonsManager
            courseId={course.id}
            lessons={lessons}
            onLessonsChange={setLessons}
          />
        </TabsContent>

        {/* ── Description Tab ─────────────────────────────────── */}
        <TabsContent value="description" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
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
                      className="min-h-40 resize-y"
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

            {/* Right column: quick info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Classification</CardTitle>
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
                </CardContent>
              </Card>

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
                    <span className="text-muted-foreground">Quizzes</span>
                    <span className="font-medium">{quizzes.length}</span>
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

        {/* ── Options Tab ─────────────────────────────────────── */}
        <TabsContent value="options" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4" />
                  Visibility
                </CardTitle>
                <CardDescription>
                  Control who can see this course in the catalog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={visibility}
                  onValueChange={(v) => setVisibility(v as CourseVisibility)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Everyone
                      </div>
                    </SelectItem>
                    <SelectItem value="signed_in">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Signed-in users only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {visibility === "everyone"
                    ? "This course is visible to everyone, including guests."
                    : "Only signed-in users can see this course."}
                </p>
              </CardContent>
            </Card>

            {/* Access Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4" />
                  Access Rules
                </CardTitle>
                <CardDescription>
                  Control how learners can enroll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={accessType}
                  onValueChange={(v) => setAccessType(v as CourseAccessType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Open enrollment
                      </div>
                    </SelectItem>
                    <SelectItem value="invitation">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        By invitation only
                      </div>
                    </SelectItem>
                    <SelectItem value="payment">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Payment required
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {accessType === "open"
                    ? "Anyone can enroll in this course freely."
                    : accessType === "invitation"
                      ? "Only users with an invitation can enroll."
                      : "Learners must pay to access this course."}
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </CardTitle>
                <CardDescription>Set the price for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
          </div>
        </TabsContent>

        {/* ── Quiz Tab ────────────────────────────────────────── */}
        <TabsContent value="quiz" className="mt-6 space-y-6">
          {selectedQuizId ? (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuizId(null)}
                className="mb-4 gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to quizzes
              </Button>
              <QuizBuilder
                courseId={course.id}
                quizId={selectedQuizId}
                onQuizUpdate={(updated) => {
                  setQuizzes((prev) =>
                    prev.map((q) => (q.id === updated.id ? updated : q)),
                  );
                }}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Course Quizzes</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage quizzes for this course
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateQuiz}
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Quiz
                </Button>
              </div>

              {loadingQuizzes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : quizzes.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <CircleHelp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">
                      No quizzes yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a quiz to test your learners&apos; knowledge
                    </p>
                    <Button
                      type="button"
                      onClick={handleCreateQuiz}
                      className="gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Quiz
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {quizzes.map((quiz) => (
                    <Card
                      key={quiz.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {quiz.title}
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">
                              {quiz.description || "No description"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <CircleHelp className="h-3 w-3" />
                            {quiz.questions_count || 0} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Pass: {quiz.passing_score}%
                          </span>
                          {quiz.time_limit_minutes && (
                            <span>⏱ {quiz.time_limit_minutes}min</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedQuizId(quiz.id)}
                            className="flex-1 gap-1.5"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Quiz?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete &ldquo;
                                  {quiz.title}&rdquo; and all its questions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
