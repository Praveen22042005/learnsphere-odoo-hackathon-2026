"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Globe, Palette, Shield, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "LearnSphere",
    siteDescription:
      "Modern eLearning platform for courses, quizzes, and certifications",
    siteUrl: "https://learnsphere.app",
    supportEmail: "support@learnsphere.app",
    theme: "system",
    enableRegistration: true,
    requireEmailVerification: true,
    enableCourseReviews: true,
    enablePublicProfiles: false,
    maintenanceMode: false,
    defaultCourseVisibility: "public",
    maxUploadSizeMB: 50,
    sessionTimeoutMinutes: 60,
    enableAuditLogging: true,
    enableAnalytics: true,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Website Settings</h2>
          <p className="text-muted-foreground">
            Configure platform-wide settings and preferences.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Site Name</Label>
              <Input
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Site URL</Label>
              <Input
                value={settings.siteUrl}
                onChange={(e) =>
                  setSettings({ ...settings, siteUrl: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Site Description</Label>
            <Textarea
              value={settings.siteDescription}
              onChange={(e) =>
                setSettings({ ...settings, siteDescription: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label>Support Email</Label>
            <Input
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Theme and visual settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(val) => setSettings({ ...settings, theme: val })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Access & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access & Security
          </CardTitle>
          <CardDescription>
            Registration, authentication, and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Registration</p>
              <p className="text-xs text-muted-foreground">
                Allow new users to create accounts
              </p>
            </div>
            <Switch
              checked={settings.enableRegistration}
              onCheckedChange={(v) =>
                setSettings({ ...settings, enableRegistration: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Verification Required</p>
              <p className="text-xs text-muted-foreground">
                Require email verification for new accounts
              </p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(v) =>
                setSettings({ ...settings, requireEmailVerification: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Course Reviews</p>
              <p className="text-xs text-muted-foreground">
                Allow learners to write course reviews
              </p>
            </div>
            <Switch
              checked={settings.enableCourseReviews}
              onCheckedChange={(v) =>
                setSettings({ ...settings, enableCourseReviews: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public Profiles</p>
              <p className="text-xs text-muted-foreground">
                Make user profiles publicly accessible
              </p>
            </div>
            <Switch
              checked={settings.enablePublicProfiles}
              onCheckedChange={(v) =>
                setSettings({ ...settings, enablePublicProfiles: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Maintenance Mode</p>
              <Badge variant="destructive" className="text-[10px]">
                CAUTION
              </Badge>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(v) =>
                setSettings({ ...settings, maintenanceMode: v })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Default Course Visibility</Label>
              <Select
                value={settings.defaultCourseVisibility}
                onValueChange={(val) =>
                  setSettings({ ...settings, defaultCourseVisibility: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="invitation_only">
                    Invitation Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Upload Size (MB)</Label>
              <Input
                type="number"
                value={settings.maxUploadSizeMB}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxUploadSizeMB: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionTimeoutMinutes: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Audit Logging</p>
              <p className="text-xs text-muted-foreground">
                Log all admin and system actions
              </p>
            </div>
            <Switch
              checked={settings.enableAuditLogging}
              onCheckedChange={(v) =>
                setSettings({ ...settings, enableAuditLogging: v })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-muted-foreground">
                Enable platform usage analytics
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(v) =>
                setSettings({ ...settings, enableAnalytics: v })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
