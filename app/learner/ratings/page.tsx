/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, StarHalf, Users } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

interface RatedCourse {
  id: string;
  title: string;
  thumbnail_url: string | null;
  category: string | null;
  average_rating: number;
  total_reviews: number;
  enrollment_count: number;
}

export default function LearnerRatingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<RatedCourse[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/learner/courses");
        if (res.ok) {
          const data = await res.json();
          const allCourses = (data.courses || [])
            .filter((c: any) => c.average_rating > 0)
            .sort((a: any, b: any) => b.average_rating - a.average_rating);
          setCourses(allCourses);
        }
      } catch {
        toast.error("Failed to load ratings");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

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
        <h2 className="font-heading text-2xl font-bold">Course Ratings</h2>
        <p className="text-muted-foreground">
          Top-rated courses by learner reviews.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="py-16 text-center">
          <StarHalf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No rated courses yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, idx) => (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/learner/courses/${course.id}`)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <span className="text-lg font-bold text-muted-foreground w-6 text-center shrink-0">
                  {idx + 1}
                </span>
                {course.thumbnail_url ? (
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      width={64}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-16 shrink-0 rounded bg-muted flex items-center justify-center">
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {course.category && <span>{course.category}</span>}
                    <span className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" /> {course.enrollment_count}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">
                      {course.average_rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {course.total_reviews} review
                    {course.total_reviews !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
