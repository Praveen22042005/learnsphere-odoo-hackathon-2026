/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Play,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";

export default function LearnerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [enrollments, setEnrollments] = useState<any[]>([]);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [enrollRes, profileRes] = await Promise.all([
          fetch("/api/learner/courses?enrolled=true"),
          fetch("/api/learner/profile"),
        ]);
        if (enrollRes.ok) {
          const d = await enrollRes.json();
          setEnrollments(d.enrollments || []);
        }
        if (profileRes.ok) {
          const d = await profileRes.json();
          setProfile(d);
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeCourses = enrollments.filter((e) => e.status === "active");
  const completedCourses = enrollments.filter((e) => e.status === "completed");
  const totalPoints = profile?.totalPoints || 0;
  const currentBadge = profile?.currentBadge;
  const nextBadge = profile?.nextBadge;
  const allBadges = profile?.allBadges || [];
  const earnedBadges = profile?.badges || [];

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold border-b-4 border-primary pb-1 inline-block">
            Learning Dashboard
          </h1>
        </div>

        {/* Welcome Banner */}
        <div className="p-6 bg-primary rounded-2xl text-primary-foreground shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Welcome back!</h2>
            <p className="opacity-90 max-w-lg">
              {enrollments.length > 0
                ? `You have ${activeCourses.length} active course${activeCourses.length !== 1 ? "s" : ""} and ${completedCourses.length} completed. Keep it up!`
                : "Start your learning journey by browsing our course catalog."}
            </p>
            {enrollments.length === 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/learner/browse")}
              >
                Browse Courses
              </Button>
            )}
          </div>
          <Award className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 text-primary-foreground opacity-10" />
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCourses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedCourses.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Cards */}
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.slice(0, 4).map((enrollment: any) => {
              const course = enrollment.course;
              if (!course) return null;
              const courseId = course.id || enrollment.course_id;
              return (
                <div
                  key={enrollment.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col"
                  onClick={() => router.push(`/learner/courses/${courseId}`)}
                >
                  <div className="h-40 relative overflow-hidden bg-muted">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="text-white w-10 h-10 fill-current" />
                    </div>
                    {enrollment.status === "completed" && (
                      <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> Done
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-primary text-lg mb-2 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description || "No description yet."}
                    </p>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        {course.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {(enrollment.time_spent_minutes || 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {enrollment.time_spent_minutes >= 60
                            ? `${Math.floor(enrollment.time_spent_minutes / 60)}h ${enrollment.time_spent_minutes % 60}m`
                            : `${enrollment.time_spent_minutes}m`}
                        </span>
                      )}
                      {course.category && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {course.category}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="w-full bg-muted rounded-full h-2 mb-4">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{
                            width: `${enrollment.progress_percentage || 0}%`,
                          }}
                        />
                      </div>
                      <Button
                        className="w-full font-bold"
                        variant={
                          (enrollment.progress_percentage || 0) > 0
                            ? "default"
                            : "secondary"
                        }
                      >
                        {enrollment.status === "completed"
                          ? "Review Course"
                          : (enrollment.progress_percentage || 0) > 0
                            ? "Continue Learning"
                            : "Start Course"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Button
              variant="link"
              onClick={() => router.push("/learner/browse")}
            >
              Explore Courses
            </Button>
          </div>
        )}

        {enrollments.length > 4 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/learner/my-courses")}
            >
              View All Courses
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar Widget */}
      <aside className="w-full xl:w-80 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-accent"
                  fill="transparent"
                  strokeDasharray="364"
                  strokeDashoffset={
                    364 - (364 * Math.min(totalPoints, 120)) / 120
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs text-muted-foreground">
                  Total {totalPoints}
                </span>
                <span className="font-bold text-xl">Points</span>
                <span className="font-bold text-accent text-sm">
                  {currentBadge?.name || "—"}
                </span>
              </div>
            </div>

            <div className="w-full mt-8 space-y-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                BADGES
              </div>
              {allBadges.map((badge: any) => {
                const isEarned =
                  totalPoints >= badge.points_value ||
                  earnedBadges.some((ub: any) => ub.badge_id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex justify-between text-sm items-center ${!isEarned ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {badge.icon_url && (
                        <Image
                          src={badge.icon_url}
                          alt={badge.name}
                          width={20}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                      )}
                      <span className="font-bold text-orange-500">
                        {badge.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {badge.points_value} Pts
                      </span>
                      {isEarned && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-5 h-5" />
              Next Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextBadge ? (
              <>
                <p className="text-sm opacity-90 mb-1">
                  Earn more points to reach
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {nextBadge.icon_url && (
                    <Image
                      src={nextBadge.icon_url}
                      alt={nextBadge.name}
                      width={40}
                      height={40}
                      className="object-contain"
                      unoptimized
                    />
                  )}
                  <div>
                    <p className="text-2xl font-bold">{nextBadge.name}</p>
                    <p className="text-xs opacity-70">
                      {nextBadge.points_value - totalPoints} points to go
                    </p>
                  </div>
                </div>
              </>
            ) : currentBadge ? (
              <>
                <p className="text-sm opacity-90 mb-1">
                  Congratulations! You&apos;ve reached the top!
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {currentBadge.icon_url && (
                    <Image
                      src={currentBadge.icon_url}
                      alt={currentBadge.name}
                      width={48}
                      height={48}
                      className="object-contain"
                      unoptimized
                    />
                  )}
                  <p className="text-2xl font-bold">{currentBadge.name}</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm opacity-90 mb-1">Start earning points!</p>
                <p className="text-2xl font-bold">
                  Complete quizzes to unlock badges
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
