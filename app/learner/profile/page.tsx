/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Star,
  Award,
  BookOpen,
  TrendingUp,
  Trophy,
  Flame,
} from "lucide-react";

export default function LearnerProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    bio: "",
  });

  useEffect(() => {
    // Check if user has a role first
    if (user) {
      const role = (user.publicMetadata as any)?.role;
      if (!role) {
        router.replace("/select-role");
        return;
      }
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/learner/profile");
      
      // If user not found (404), redirect to select role
      if (response.status === 404) {
        toast.error("Profile not found. Please select your role first.");
        router.replace("/select-role");
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfileData(data);

      setFormData({
        bio: data.profile?.bio || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
      // Redirect to dashboard on error to avoid infinite loop
      setTimeout(() => router.replace("/dashboard"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/learner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const profile = profileData?.profile;
  const stats = profileData?.stats;
  const currentBadge = profileData?.currentBadge;
  const nextBadge = profileData?.nextBadge;
  const totalPoints = profileData?.totalPoints || 0;

  const progressToNextBadge = nextBadge
    ? ((totalPoints - currentBadge?.points_value || 0) /
        (nextBadge.points_value - (currentBadge?.points_value || 0))) *
      100
    : 100;

  const firstName = profileData?.user?.first_name || "";
  const lastName = profileData?.user?.last_name || "";
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learner Profile</h1>
          <p className="text-muted-foreground">
            View your learning progress and update your profile
          </p>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Level {profile?.level || 1}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedCourses || 0} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profileData?.badges?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.streak_days || 0} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Progress */}
      {currentBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Badge Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current: {currentBadge.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentBadge.description}
                </p>
              </div>
              {nextBadge && (
                <div className="text-right">
                  <p className="font-medium">Next: {nextBadge.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextBadge.points_value - totalPoints} points to go
                  </p>
                </div>
              )}
            </div>
            {nextBadge && (
              <Progress value={progressToNextBadge} className="h-2" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Learning Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Courses
              </p>
              <p className="text-2xl font-bold">{stats?.activeCourses || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Progress
              </p>
              <p className="text-2xl font-bold">
                {stats?.averageProgress || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Quizzes Taken
              </p>
              <p className="text-2xl font-bold">
                {profileData?.quizStats?.totalAttempts || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Quiz Success Rate
              </p>
              <p className="text-2xl font-bold">
                {profileData?.quizStats?.totalAttempts
                  ? Math.round(
                      (profileData.quizStats.passedQuizzes /
                        profileData.quizStats.totalAttempts) *
                        100,
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.imageUrl} alt={firstName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Profile synced from Clerk
              </p>
            </div>
          </div>

          <Separator />

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself and your learning goals..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Badges */}
      {profileData?.badges && profileData.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {profileData.badges.slice(0, 6).map((userBadge: any) => (
                <div
                  key={userBadge.id}
                  className="flex flex-col items-center p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Award className="h-8 w-8 text-yellow-500 mb-2" />
                  <p className="text-sm font-medium text-center">
                    {userBadge.badge?.name}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {new Date(userBadge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
