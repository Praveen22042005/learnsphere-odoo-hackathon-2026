/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Users,
  BookOpen,
  Star,
  Briefcase,
  Globe,
  Linkedin,
  X,
} from "lucide-react";

export default function InstructorProfilePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    expertise: [] as string[],
    years_experience: 0,
    website_url: "",
    linkedin_url: "",
  });
  const [newExpertise, setNewExpertise] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/instructor/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfileData(data);

      setFormData({
        first_name: data.user.first_name || "",
        last_name: data.user.last_name || "",
        bio: data.profile.bio || "",
        expertise: data.profile.expertise || [],
        years_experience: data.profile.years_experience || 0,
        website_url: data.profile.website_url || "",
        linkedin_url: data.profile.linkedin_url || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/instructor/profile", {
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

  const addExpertise = () => {
    if (
      newExpertise.trim() &&
      !formData.expertise.includes(newExpertise.trim())
    ) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, newExpertise.trim()],
      });
      setNewExpertise("");
    }
  };

  const removeExpertise = (item: string) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((e) => e !== item),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials =
    `${formData.first_name?.[0] || ""}${formData.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and credentials
          </p>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profileData?.profile?.total_courses || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profileData?.profile?.total_students || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profileData?.profile?.average_rating || 0} / 5
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formData.years_experience || 0} years
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and bio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.imageUrl} alt={formData.first_name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-sm text-muted-foreground">Synced from Clerk</p>
            </div>
          </div>

          <Separator />

          {/* Name Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell students about yourself and your teaching experience..."
              rows={4}
            />
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="years_experience">Years of Experience</Label>
            <Input
              id="years_experience"
              type="number"
              min="0"
              value={formData.years_experience}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  years_experience: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expertise */}
      <Card>
        <CardHeader>
          <CardTitle>Areas of Expertise</CardTitle>
          <CardDescription>
            Add your skills and teaching specializations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              placeholder="e.g., Web Development, Python, Machine Learning"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addExpertise();
                }
              }}
            />
            <Button onClick={addExpertise} variant="secondary">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.expertise.map((item) => (
              <Badge key={item} variant="secondary" className="px-3 py-1">
                {item}
                <button
                  onClick={() => removeExpertise(item)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {formData.expertise.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No expertise added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social & Professional Links</CardTitle>
          <CardDescription>
            Share your website and professional profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website_url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website URL
            </Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) =>
                setFormData({ ...formData, website_url: e.target.value })
              }
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn URL
            </Label>
            <Input
              id="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={(e) =>
                setFormData({ ...formData, linkedin_url: e.target.value })
              }
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </CardContent>
      </Card>

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
