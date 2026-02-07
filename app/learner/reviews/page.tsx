/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseReview {
  courseId: string;
  courseTitle: string;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  } | null;
}

export default function LearnerReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const enrollRes = await fetch("/api/learner/courses?enrolled=true");
        if (!enrollRes.ok) throw new Error();
        const enrollData = await enrollRes.json();
        const enrollments = enrollData.enrollments || [];

        const reviews: CourseReview[] = [];
        for (const enrollment of enrollments) {
          const courseId = enrollment.course?.id || enrollment.course_id;
          const courseTitle = enrollment.course?.title || "Unknown Course";

          try {
            const revRes = await fetch(
              `/api/learner/courses/${courseId}/reviews`,
            );
            if (revRes.ok) {
              const revData = await revRes.json();
              // Find current user's review among all reviews
              // Simple: show the first review matching (API returns all published reviews)
              const myReview = revData.reviews?.find(
                (r: any) => r.learner_id === enrollment.learner_id,
              );
              reviews.push({ courseId, courseTitle, review: myReview || null });
            } else {
              reviews.push({ courseId, courseTitle, review: null });
            }
          } catch {
            reviews.push({ courseId, courseTitle, review: null });
          }
        }

        setCourseReviews(reviews);
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const reviewedCourses = courseReviews.filter((cr) => cr.review);
  const unreviewed = courseReviews.filter((cr) => !cr.review);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">My Reviews</h2>
        <p className="text-muted-foreground">
          Reviews you&apos;ve submitted for courses you&apos;re enrolled in.
        </p>
      </div>

      {reviewedCourses.length === 0 && unreviewed.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No courses to review yet.</p>
          <Button variant="link" onClick={() => router.push("/learner/browse")}>
            Browse Courses
          </Button>
        </div>
      ) : (
        <>
          {/* Reviewed courses */}
          {reviewedCourses.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Your Reviews</h3>
              {reviewedCourses.map((cr) => (
                <Card key={cr.courseId}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium">{cr.courseTitle}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (cr.review?.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-sm ml-1">
                            {cr.review?.rating}/5
                          </span>
                        </div>
                        {cr.review?.comment && (
                          <p className="text-sm text-muted-foreground">
                            {cr.review.comment}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            cr.review?.created_at || "",
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/learner/courses/${cr.courseId}`)
                        }
                        className="shrink-0 gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Not yet reviewed */}
          {unreviewed.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Ready to Review</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {unreviewed.map((cr) => (
                  <Card
                    key={cr.courseId}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="flex items-center justify-between gap-2 pt-4">
                      <p className="font-medium text-sm truncate">
                        {cr.courseTitle}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/learner/courses/${cr.courseId}`)
                        }
                        className="shrink-0"
                      >
                        Review
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
