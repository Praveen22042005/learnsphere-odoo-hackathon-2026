"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Video,
  FileText,
  CircleHelp,
  ClipboardList,
  FileDown,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  List,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

function lessonIcon(type: string) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "text":
      return <FileText className="h-4 w-4" />;
    case "quiz":
      return <CircleHelp className="h-4 w-4" />;
    case "assignment":
      return <ClipboardList className="h-4 w-4" />;
    case "document":
      return <FileDown className="h-4 w-4" />;
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  lesson_type: string;
  content: string | null;
  video_url: string | null;
  external_video_url: string | null;
  file_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free_preview: boolean;
  allow_download: boolean;
}

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>(
    {},
  );
  const [completedLessons, setCompletedLessons] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const res = await fetch(`/api/learner/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons || []);
        setLessonProgress(data.lessonProgress || {});
        setCompletedLessons(data.completedLessons || 0);

        // The learner course API now returns full lesson data for enrolled users
        const lessonInList = (data.lessons || []).find(
          (l: LessonData) => l.id === lessonId,
        );
        if (lessonInList) {
          setCurrentLesson(lessonInList);
        }
      } catch {
        toast.error("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId, lessonId]);

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = lessonProgress[lessonId];

  const markComplete = useCallback(async () => {
    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/learner/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, is_completed: true }),
      });

      if (!res.ok) throw new Error("Failed to update progress");

      const data = await res.json();
      setLessonProgress((prev) => ({ ...prev, [lessonId]: true }));
      setCompletedLessons(data.completedCount || completedLessons + 1);
      toast.success("Lesson marked as complete!");
    } catch {
      toast.error("Failed to mark lesson as complete");
    } finally {
      setMarkingComplete(false);
    }
  }, [courseId, lessonId, completedLessons]);

  const navigateToLesson = (id: string) => {
    router.push(`/learner/courses/${courseId}/lessons/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button
          variant="link"
          onClick={() => router.push(`/learner/courses/${courseId}`)}
        >
          Back to Course
        </Button>
      </div>
    );
  }

  const progressPct =
    lessons.length > 0
      ? Math.round((completedLessons / lessons.length) * 100)
      : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 left-2 z-20 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
      </Button>

      {/* Lesson sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 absolute lg:relative z-10 w-72 shrink-0 border-r bg-background transition-transform h-full`}
      >
        <div className="p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 w-full justify-start"
            onClick={() => router.push(`/learner/courses/${courseId}`)}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Course
          </Button>
          <p className="text-sm font-semibold mt-2 truncate">{course?.title}</p>
          <Progress value={progressPct} className="h-1.5 mt-2" />
          <p className="text-[10px] text-muted-foreground mt-1">
            {completedLessons}/{lessons.length} completed
          </p>
        </div>

        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="p-2 space-y-0.5">
            {lessons.map((lesson, idx) => {
              const isActive = lesson.id === lessonId;
              const done = lessonProgress[lesson.id];
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    navigateToLesson(lesson.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span className="truncate">{lesson.title}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Lesson content */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Lesson header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {lessonIcon(currentLesson.lesson_type)}
                <span className="capitalize">{currentLesson.lesson_type}</span>
                {currentLesson.duration_minutes && (
                  <>
                    <span>·</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{currentLesson.duration_minutes} min</span>
                  </>
                )}
                {isCompleted && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-emerald-100 text-emerald-700 text-[10px]"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                  </Badge>
                )}
              </div>
              <h1 className="font-heading text-xl font-bold">
                {currentLesson.title}
              </h1>
              {currentLesson.description && (
                <p className="text-muted-foreground text-sm mt-1">
                  {currentLesson.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Video player */}
            {currentLesson.lesson_type === "video" &&
              (currentLesson.video_url || currentLesson.external_video_url) && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  {(
                    currentLesson.video_url || currentLesson.external_video_url
                  )?.includes("youtube") ||
                  (
                    currentLesson.video_url || currentLesson.external_video_url
                  )?.includes("youtu.be") ? (
                    <iframe
                      src={getYoutubeEmbedUrl(
                        currentLesson.video_url ||
                          currentLesson.external_video_url ||
                          "",
                      )}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                      currentLesson.video_url ||
                      currentLesson.external_video_url
                    )?.includes("vimeo") ? (
                    <iframe
                      src={getVimeoEmbedUrl(
                        currentLesson.video_url ||
                          currentLesson.external_video_url ||
                          "",
                      )}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={
                        currentLesson.video_url ||
                        currentLesson.external_video_url ||
                        ""
                      }
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}

            {/* Image */}
            {currentLesson.lesson_type === "image" &&
              currentLesson.file_url && (
                <div className="rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentLesson.file_url}
                    alt={currentLesson.title}
                    className="w-full"
                  />
                </div>
              )}

            {/* Document / file download */}
            {currentLesson.lesson_type === "document" &&
              currentLesson.file_url && (
                <Card>
                  <CardContent className="flex items-center gap-4 py-4">
                    <FileDown className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{currentLesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Document resource
                      </p>
                    </div>
                    {currentLesson.allow_download && (
                      <a
                        href={currentLesson.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Text / article content */}
            {currentLesson.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatContent(currentLesson.content),
                  }}
                />
              </div>
            )}

            {/* Quiz lesson - redirect to quiz page */}
            {currentLesson.lesson_type === "quiz" && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CircleHelp className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {currentLesson.title}
                  </h3>
                  {currentLesson.description && (
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      {currentLesson.description}
                    </p>
                  )}
                  <Button
                    onClick={() => router.push("/learner/quizzes")}
                    className="gap-2"
                  >
                    <CircleHelp className="h-4 w-4" />
                    Go to Quizzes
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* No content fallback */}
            {!currentLesson.content &&
              !currentLesson.video_url &&
              !currentLesson.external_video_url &&
              !currentLesson.file_url &&
              currentLesson.lesson_type !== "quiz" && (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Content coming soon.</p>
                </div>
              )}
          </div>
        </ScrollArea>

        {/* Bottom navigation bar */}
        <div className="border-t bg-background px-4 py-3 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => prevLesson && navigateToLesson(prevLesson.id)}
            disabled={!prevLesson}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <Button
                size="sm"
                variant="default"
                onClick={markComplete}
                disabled={markingComplete}
                className="gap-1"
              >
                {markingComplete ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Mark Complete
              </Button>
            )}
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
            disabled={!nextLesson}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper functions ──────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

function formatContent(content: string): string {
  // Basic markdown-like rendering: support line breaks and paragraphs
  return content
    .split("\n\n")
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
}
