"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
import { Separator } from "@/components/ui/separator";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Programming",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "Blockchain",
  "Design",
  "Business",
  "Marketing",
  "Other",
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "No prior knowledge needed" },
  {
    value: "intermediate",
    label: "Intermediate",
    desc: "Some experience required",
  },
  { value: "advanced", label: "Advanced", desc: "Strong foundation expected" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [creating, setCreating] = useState(false);

  const canCreate = title.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create course");
      }

      const { course } = await res.json();

      // If extra fields were filled, patch the course immediately
      const patchBody: Record<string, string> = {};
      if (description.trim()) patchBody.description = description.trim();
      if (category) patchBody.category = category;
      if (difficulty) patchBody.difficulty_level = difficulty;

      if (Object.keys(patchBody).length > 0) {
        await fetch(`/api/courses/${course.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        });
      }

      toast.success("Course created! Redirecting to editor...");
      router.push(`/instructor/courses/${course.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create course",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push("/instructor/courses")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">Create New Course</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details to get started. You can always edit these later.
        </p>
      </div>

      <Separator />

      {/* Course Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Course Details
          </CardTitle>
          <CardDescription>
            Start with a title — everything else is optional for now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Machine Learning"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) handleCreate();
              }}
              autoFocus
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground">
              Choose a clear, descriptive title that tells learners what
              they&apos;ll learn.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what students will learn in this course..."
              className="min-h-24 resize-y"
              disabled={creating}
            />
          </div>

          {/* Category & Difficulty row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      <span className="flex flex-col">
                        <span>{d.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">What happens next?</p>
            <p className="text-xs text-muted-foreground">
              After creating your course, you&apos;ll be taken to the full
              course editor where you can add lessons, set pricing, upload a
              thumbnail, manage tags, and publish when you&apos;re ready.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/instructor/courses")}
          disabled={creating}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!canCreate || creating}
          className="gap-2 shadow-sm"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {creating ? "Creating..." : "Create Course"}
        </Button>
      </div>
    </div>
  );
}
