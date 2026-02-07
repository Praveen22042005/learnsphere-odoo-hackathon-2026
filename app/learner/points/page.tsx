/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, Trophy, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function LearnerPointsPage() {
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
        toast.error("Failed to load profile");
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

  const totalPoints = profile?.totalPoints || 0;
  const currentBadge = profile?.currentBadge;
  const nextBadge = profile?.nextBadge;
  const quizStats = profile?.quizStats || {};
  const stats = profile?.stats || {};

  const nextBadgeProgress = nextBadge
    ? Math.min(100, Math.round((totalPoints / nextBadge.min_points) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Points & Rewards</h2>
        <p className="text-muted-foreground">
          Track your points earned from quizzes and activities.
        </p>
      </div>

      {/* Main points card */}
      <Card className="bg-linear-to-br from-primary/10 via-background to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-primary"
                    fill="transparent"
                    strokeDasharray="352"
                    strokeDashoffset={352 - (352 * nextBadgeProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Star className="h-5 w-5 text-primary mb-1" />
                  <span className="text-2xl font-bold">{totalPoints}</span>
                  <span className="text-[10px] text-muted-foreground">
                    POINTS
                  </span>
                </div>
              </div>
            </div>
            {currentBadge && (
              <div>
                <Badge className="text-sm">{currentBadge.name}</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Current Level
                </p>
              </div>
            )}
            {nextBadge && (
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    Next: {nextBadge.name}
                  </span>
                  <span>
                    {totalPoints}/{nextBadge.min_points} pts
                  </span>
                </div>
                <Progress value={nextBadgeProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quiz Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizStats.totalPointsFromQuizzes || 0}
            </div>
            <p className="text-xs text-muted-foreground">From passed quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Quizzes Passed
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizStats.passedQuizzes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {quizStats.totalAttempts || 0} attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quizStats.averageScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Across all quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Done</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>
      </div>

      {/* How to earn points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Pass a quiz on 1st attempt</span>
              <Badge variant="secondary">15 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pass a quiz on 2nd attempt</span>
              <Badge variant="secondary">10 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pass a quiz on 3rd attempt</span>
              <Badge variant="secondary">5 pts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pass a quiz on 4th+ attempt</span>
              <Badge variant="secondary">2 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
