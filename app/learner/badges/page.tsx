/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const BADGE_COLORS: Record<string, string> = {
  Newbie: "from-orange-400 to-orange-600",
  Explorer: "from-blue-400 to-blue-600",
  Achiever: "from-green-400 to-green-600",
  Specialist: "from-purple-400 to-purple-600",
  Expert: "from-red-400 to-red-600",
  Master: "from-amber-400 to-amber-600",
};

export default function LearnerBadgesPage() {
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
        toast.error("Failed to load badges");
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
  const earnedBadges = profile?.badges || [];
  void earnedBadges; // used for reference

  // All badge levels from the system (defined in schema seed)
  const allBadges = [
    { name: "Newbie", min_points: 20, icon: "🌱" },
    { name: "Explorer", min_points: 40, icon: "🧭" },
    { name: "Achiever", min_points: 60, icon: "🏅" },
    { name: "Specialist", min_points: 80, icon: "⭐" },
    { name: "Expert", min_points: 100, icon: "💎" },
    { name: "Master", min_points: 120, icon: "👑" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Badges</h2>
        <p className="text-muted-foreground">
          Earn points from quizzes to unlock badges. You have {totalPoints}{" "}
          points.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allBadges.map((badge) => {
          const isEarned = totalPoints >= badge.min_points;
          const progress = Math.min(
            100,
            Math.round((totalPoints / badge.min_points) * 100),
          );
          const bgColor =
            BADGE_COLORS[badge.name] || "from-gray-400 to-gray-600";

          return (
            <Card
              key={badge.name}
              className={`transition-all ${isEarned ? "border-primary/40 shadow-md" : "opacity-70"}`}
            >
              <CardContent className="pt-6 text-center space-y-3">
                <div
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                    isEarned
                      ? `bg-linear-to-br ${bgColor} text-white shadow-lg`
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isEarned ? badge.icon : <Lock className="h-6 w-6" />}
                </div>
                <div>
                  <p className="font-bold text-lg">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {badge.min_points} points required
                  </p>
                </div>
                {isEarned ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Earned
                  </Badge>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {totalPoints}/{badge.min_points}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
