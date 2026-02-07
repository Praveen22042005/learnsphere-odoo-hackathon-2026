"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Video,
  FileText,
  CircleHelp,
  ClipboardList,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Lesson, LessonType } from "@/types/lesson";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";

// ─── Constants ────────────────────────────────────────────────────────────────

const LESSON_TYPES: { value: LessonType; label: string; icon: typeof Video }[] =
  [
    { value: "video", label: "Video", icon: Video },
    { value: "text", label: "Text / Article", icon: FileText },
    { value: "quiz", label: "Quiz", icon: CircleHelp },
    { value: "assignment", label: "Assignment", icon: ClipboardList },
  ];

function lessonTypeIcon(type: LessonType) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "text":
      return <FileText className="h-4 w-4" />;
    case "quiz":
      return <CircleHelp className="h-4 w-4" />;
    case "assignment":
      return <ClipboardList className="h-4 w-4" />;
  }
}

function lessonTypeBadge(type: LessonType) {
  switch (type) {
    case "video":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "text":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "quiz":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400";
    case "assignment":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400";
  }
}

// ─── Lesson Editor Inline ─────────────────────────────────────────────────────

function LessonEditor({
  lesson,
  courseId,
  onSave,
  onCancel,
}: {
  lesson: Lesson;
  courseId: string;
  onSave: (updated: Lesson) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");
  const [content, setContent] = useState(lesson.content || "");
  const [videoUrl, setVideoUrl] = useState(lesson.video_url || "");
  const [duration, setDuration] = useState(
    lesson.duration_minutes?.toString() || "",
  );
  const [lessonType, setLessonType] = useState<LessonType>(lesson.lesson_type);
  const [isFreePreview, setIsFreePreview] = useState(lesson.is_free_preview);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          lesson_type: lessonType,
          content: content.trim() || null,
          video_url: videoUrl.trim() || null,
          duration_minutes: duration ? parseInt(duration) : null,
          is_free_preview: isFreePreview,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save lesson");
      }

      const { lesson: updated } = await res.json();
      onSave(updated);
      toast.success("Lesson saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Edit Lesson</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
            className="h-7 px-2"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
          />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={lessonType}
            onValueChange={(v) => setLessonType(v as LessonType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LESSON_TYPES.map((lt) => (
                <SelectItem key={lt.value} value={lt.value}>
                  <span className="flex items-center gap-2">
                    <lt.icon className="h-3.5 w-3.5" />
                    {lt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this lesson..."
          className="min-h-20 resize-y"
        />
      </div>

      {(lessonType === "text" || lessonType === "assignment") && (
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your lesson content here..."
            className="min-h-50 resize-y font-mono text-sm"
          />
        </div>
      )}

      {lessonType === "video" && (
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 15"
          />
        </div>

        <div className="flex items-center justify-between pt-6">
          <div>
            <Label>Free Preview</Label>
            <p className="text-xs text-muted-foreground">
              Allow non-enrolled learners to view
            </p>
          </div>
          <Switch checked={isFreePreview} onCheckedChange={setIsFreePreview} />
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="gap-1.5"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving..." : "Save Lesson"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Lessons Manager ─────────────────────────────────────────────────────

export function LessonsManager({
  courseId,
  lessons,
  onLessonsChange,
}: {
  courseId: string;
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<LessonType>("video");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Create Lesson ──
  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          lesson_type: newType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create lesson");
      }

      const { lesson } = await res.json();
      onLessonsChange([...lessons, lesson]);
      toast.success("Lesson created!");
      setCreateOpen(false);
      setNewTitle("");
      setNewType("video");
      // Open in edit mode immediately
      setEditingId(lesson.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create lesson",
      );
    } finally {
      setCreating(false);
    }
  }, [courseId, lessons, newTitle, newType, onLessonsChange]);

  // ── Delete Lesson ──
  const handleDelete = useCallback(
    async (lessonId: string) => {
      setDeletingId(lessonId);
      try {
        const res = await fetch(
          `/api/courses/${courseId}/lessons/${lessonId}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete lesson");
        }

        onLessonsChange(lessons.filter((l) => l.id !== lessonId));
        toast.success("Lesson deleted");
        if (editingId === lessonId) setEditingId(null);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete lesson",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [courseId, lessons, editingId, onLessonsChange],
  );

  // ── Reorder ──
  const moveLesson = useCallback(
    async (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= lessons.length) return;

      const reordered = [...lessons];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(newIndex, 0, moved);

      // Update order_index for swapped items
      const updated = reordered.map((l, i) => ({ ...l, order_index: i }));
      onLessonsChange(updated);

      // Persist the two changed items
      try {
        await Promise.all([
          fetch(`/api/courses/${courseId}/lessons/${updated[index].id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_index: index }),
          }),
          fetch(`/api/courses/${courseId}/lessons/${updated[newIndex].id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_index: newIndex }),
          }),
        ]);
      } catch {
        toast.error("Failed to reorder lessons");
      }
    },
    [courseId, lessons, onLessonsChange],
  );

  // ── Save from inline editor ──
  const handleLessonSave = useCallback(
    (updated: Lesson) => {
      onLessonsChange(lessons.map((l) => (l.id === updated.id ? updated : l)));
      setEditingId(null);
    },
    [lessons, onLessonsChange],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold">
            Course Lessons
          </h3>
          <p className="text-xs text-muted-foreground">
            Add and organise your course content. Drag to reorder.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Lesson
        </Button>
      </div>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="mb-1 text-base">No lessons yet</CardTitle>
            <CardDescription className="max-w-sm text-sm">
              Start building your course by adding your first lesson. You can
              add videos, text content, quizzes, and assignments.
            </CardDescription>
            <Button
              className="mt-4 gap-1.5"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, index) =>
            editingId === lesson.id ? (
              <LessonEditor
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
                onSave={handleLessonSave}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={lesson.id}
                className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/5"
              >
                {/* Handle */}
                <div className="flex flex-col items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => moveLesson(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => moveLesson(index, "down")}
                    disabled={index === lessons.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Order number */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
                  {index + 1}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {lesson.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0 gap-1 text-[10px]",
                        lessonTypeBadge(lesson.lesson_type),
                      )}
                    >
                      {lessonTypeIcon(lesson.lesson_type)}
                      {lesson.lesson_type}
                    </Badge>
                    {lesson.is_free_preview && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Eye className="h-2.5 w-2.5" />
                        Free
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {lesson.duration_minutes && (
                      <span>{lesson.duration_minutes} min</span>
                    )}
                    {lesson.description && (
                      <span className="truncate">{lesson.description}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditingId(lesson.id)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        disabled={deletingId === lesson.id}
                      >
                        {deletingId === lesson.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &ldquo;{lesson.title}
                          &rdquo;. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(lesson.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Create Lesson Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Choose a title and type for your lesson.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lesson Title *</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Introduction to Variables"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTitle.trim()) handleCreate();
                }}
                autoFocus
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {LESSON_TYPES.map((lt) => (
                  <button
                    key={lt.value}
                    onClick={() => setNewType(lt.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                      newType === lt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:bg-muted",
                    )}
                    disabled={creating}
                  >
                    <lt.icon className="h-4 w-4 shrink-0" />
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setNewTitle("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || creating}
              className="gap-1.5"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {creating ? "Creating..." : "Add Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
