"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Users,
  Star,
  BookOpen,
  Lock,
  FileText,
  Video,
  CircleHelp,
  ClipboardList,
  ImageIcon,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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

interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  lesson_type: string;
  duration_minutes: number | null;
  order_index: number;
  is_free_preview: boolean;
}

export default function LearnerCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [enrollment, setEnrollment] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>(
    {},
  );
  const [completedLessons, setCompletedLessons] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/learner/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons || []);
        setEnrollment(data.enrollment);
        setLessonProgress(data.lessonProgress || {});
        setCompletedLessons(data.completedLessons || 0);
        setReviews(data.reviews || []);
      } catch {
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(`/api/learner/courses/${courseId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enroll");
      }
      const data = await res.json();
      setEnrollment(data.enrollment);
      toast.success("Successfully enrolled!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/learner/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      const data = await res.json();
      toast.success("Review submitted!");
      setReviews((prev) => [
        data.review,
        ...prev.filter((r: { id: string }) => r.id !== data.review.id),
      ]);
      setReviewComment("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const navigateToLesson = (lessonId: string) => {
    router.push(`/learner/courses/${courseId}/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Course not found.</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const progressPct =
    lessons.length > 0
      ? Math.round((completedLessons / lessons.length) * 100)
      : 0;
  const totalDuration = lessons.reduce(
    (sum, l) => sum + (l.duration_minutes || 0),
    0,
  );

  // Find first incomplete lesson for "Continue" button
  const nextLesson = lessons.find((l) => !lessonProgress[l.id]);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Hero section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {course.thumbnail_url && (
            <div className="aspect-video overflow-hidden rounded-xl border bg-muted">
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {course.category && (
                <Badge variant="secondary">{course.category}</Badge>
              )}
              {course.difficulty_level && (
                <Badge variant="outline" className="capitalize">
                  {course.difficulty_level}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.enrollment_count} enrolled
              </span>
              {course.average_rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {course.average_rating.toFixed(1)}
                </span>
              )}
              {totalDuration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {totalDuration >= 60
                    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                    : `${totalDuration}m`}
                </span>
              )}
            </div>
          </div>
          {course.description && (
            <p className="text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Sidebar action card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {enrollment ? (
                <>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Your Progress</p>
                    <p className="text-3xl font-bold text-primary">
                      {progressPct}%
                    </p>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {completedLessons} of {lessons.length} lessons completed
                  </p>
                  {nextLesson ? (
                    <Button
                      className="w-full gap-2"
                      onClick={() => navigateToLesson(nextLesson.id)}
                    >
                      <Play className="h-4 w-4" />
                      {completedLessons > 0
                        ? "Continue Learning"
                        : "Start Course"}
                    </Button>
                  ) : (
                    <div className="text-center py-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-emerald-600">
                        Course Completed!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center space-y-1">
                    {course.is_free ? (
                      <p className="text-2xl font-bold text-emerald-600">
                        Free
                      </p>
                    ) : (
                      <p className="text-2xl font-bold">${course.price}</p>
                    )}
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                    {course.is_free || course.access_type === "open"
                      ? "Enroll for Free"
                      : `Enroll — $${course.price}`}
                  </Button>
                </>
              )}

              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {course.estimated_duration_hours
                      ? `${course.estimated_duration_hours}h`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Access</span>
                  <span className="font-medium capitalize">
                    {course.access_type || "open"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs: Lessons & Reviews */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-4 space-y-2">
          {lessons.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No lessons yet.
            </p>
          ) : (
            lessons.map((lesson, idx) => {
              const completed = lessonProgress[lesson.id];
              const isLocked = !enrollment && !lesson.is_free_preview;

              return (
                <Card
                  key={lesson.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${completed ? "border-emerald-200 dark:border-emerald-800/40" : ""}`}
                  onClick={() => {
                    if (isLocked) {
                      toast.info("Enroll to access this lesson");
                      return;
                    }
                    navigateToLesson(lesson.id);
                  }}
                >
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {lessonIcon(lesson.lesson_type)}
                        <span className="capitalize">{lesson.lesson_type}</span>
                        {lesson.duration_minutes && (
                          <span>· {lesson.duration_minutes} min</span>
                        )}
                      </div>
                    </div>
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : lesson.is_free_preview && !enrollment ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        Preview
                      </Badge>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-4">
          {/* Submit review form (only if enrolled) */}
          {enrollment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leave a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {reviewRating}/5
                  </span>
                </div>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this course..."
                  className="min-h-20"
                />
                <Button
                  size="sm"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : null}
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}

          {reviews.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No reviews yet.
            </p>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.learner?.first_name || "Anonymous"}{" "}
                      {review.learner?.last_name || ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">
                      {review.review_text}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
