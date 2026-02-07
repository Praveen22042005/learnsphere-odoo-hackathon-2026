/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Loader2, Trophy, Target, BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LearnerAchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/learner/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        toast.error("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = profile?.stats || {};
  const quizStats = profile?.quizStats || {};
  const achievements = profile?.achievements || [];

  // Define milestones (could be stored in DB - here showing computed ones)
  const milestones = [
    {
      title: "First Course",
      description: "Enroll in your first course",
      icon: BookOpen,
      earned: stats.totalCourses > 0,
      progress: Math.min(stats.totalCourses || 0, 1),
      target: 1,
    },
    {
      title: "Course Completer",
      description: "Complete your first course",
      icon: CheckCircle2,
      earned: stats.completedCourses > 0,
      progress: Math.min(stats.completedCourses || 0, 1),
      target: 1,
    },
    {
      title: "Quiz Ace",
      description: "Pass 5 quizzes",
      icon: Target,
      earned: (quizStats.passedQuizzes || 0) >= 5,
      progress: Math.min(quizStats.passedQuizzes || 0, 5),
      target: 5,
    },
    {
      title: "Dedicated Learner",
      description: "Enroll in 5 courses",
      icon: BookOpen,
      earned: (stats.totalCourses || 0) >= 5,
      progress: Math.min(stats.totalCourses || 0, 5),
      target: 5,
    },
    {
      title: "Quiz Master",
      description: "Pass 10 quizzes",
      icon: Trophy,
      earned: (quizStats.passedQuizzes || 0) >= 10,
      progress: Math.min(quizStats.passedQuizzes || 0, 10),
      target: 10,
    },
    {
      title: "Scholar",
      description: "Complete 5 courses",
      icon: Trophy,
      earned: (stats.completedCourses || 0) >= 5,
      progress: Math.min(stats.completedCourses || 0, 5),
      target: 5,
    },
    {
      title: "Perfect Score",
      description: "Score 100% on any quiz",
      icon: Target,
      earned:
        (quizStats.averageScore || 0) >= 100 ||
        (quizStats.passedQuizzes || 0) > 0,
      progress: quizStats.averageScore >= 100 ? 1 : 0,
      target: 1,
    },
    {
      title: "Course Collector",
      description: "Enroll in 10 courses",
      icon: BookOpen,
      earned: (stats.totalCourses || 0) >= 10,
      progress: Math.min(stats.totalCourses || 0, 10),
      target: 10,
    },
  ];

  const earnedCount = milestones.filter((m) => m.earned).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Achievements</h2>
        <p className="text-muted-foreground">
          {earnedCount} of {milestones.length} achievements unlocked.
        </p>
      </div>

      {/* Achievement progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {earnedCount}/{milestones.length} Achievements
              </p>
              <Progress
                value={(earnedCount / milestones.length) * 100}
                className="h-2 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {milestones.map((milestone) => {
          const progressPct =
            milestone.target > 0
              ? Math.round((milestone.progress / milestone.target) * 100)
              : 0;
          const Icon = milestone.icon;

          return (
            <Card
              key={milestone.title}
              className={`transition-all ${milestone.earned ? "border-primary/40" : "opacity-60"}`}
            >
              <CardContent className="flex items-start gap-4 pt-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    milestone.earned
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{milestone.title}</p>
                    {milestone.earned && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 text-[10px]"
                      >
                        Earned
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {milestone.description}
                  </p>
                  {!milestone.earned && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span>
                          {milestone.progress}/{milestone.target}
                        </span>
                        <span>{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* DB achievements (if any) */}
      {achievements.length > 0 && (
        <>
          <h3 className="font-semibold text-lg mt-8">Special Achievements</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((a: any) => (
              <Card key={a.id}>
                <CardContent className="flex items-center gap-3 pt-4">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="font-medium text-sm">
                      {a.achievement?.title || "Achievement"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Earned {new Date(a.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
