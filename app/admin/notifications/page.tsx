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
import { Bell, Mail, MessageSquare, Send, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@learnsphere.app",
    fromName: "LearnSphere",
  });

  const [notifications, setNotifications] = useState({
    newEnrollment: true,
    courseCompletion: true,
    quizResult: true,
    newReview: true,
    userRegistration: true,
    systemAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const [templates, setTemplates] = useState({
    welcomeSubject: "Welcome to LearnSphere!",
    welcomeBody:
      "Hi {{name}},\n\nWelcome to LearnSphere! We're excited to have you on board.\n\nGet started by exploring our course catalog.\n\nBest,\nThe LearnSphere Team",
    enrollmentSubject: "You've been enrolled in {{course_name}}",
    completionSubject: "Congratulations on completing {{course_name}}! 🎉",
  });

  const handleSave = () => {
    toast.success("Notification settings saved");
  };

  const handleTestEmail = () => {
    toast.info("Test email sent (simulated)");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">
            Email & Notifications
          </h2>
          <p className="text-muted-foreground">
            Configure email delivery and notification preferences.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration (SMTP)
          </CardTitle>
          <CardDescription>
            Configure outgoing email server settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>SMTP Host</Label>
              <Input
                value={emailSettings.smtpHost}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpHost: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>SMTP Port</Label>
              <Input
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPort: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Username</Label>
              <Input
                value={emailSettings.smtpUser}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpUser: e.target.value,
                  })
                }
                placeholder="SMTP username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    smtpPassword: e.target.value,
                  })
                }
                placeholder="SMTP password"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>From Email</Label>
              <Input
                value={emailSettings.fromEmail}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    fromEmail: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>From Name</Label>
              <Input
                value={emailSettings.fromName}
                onChange={(e) =>
                  setEmailSettings({
                    ...emailSettings,
                    fromName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <Button variant="outline" onClick={handleTestEmail}>
            <Send className="mr-2 h-4 w-4" /> Send Test Email
          </Button>
        </CardContent>
      </Card>

      {/* Notification Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Events
          </CardTitle>
          <CardDescription>
            Choose which events trigger email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              key: "newEnrollment",
              label: "New Enrollment",
              desc: "When a learner enrolls in a course",
            },
            {
              key: "courseCompletion",
              label: "Course Completion",
              desc: "When a learner completes a course",
            },
            {
              key: "quizResult",
              label: "Quiz Results",
              desc: "When a learner submits a quiz",
            },
            {
              key: "newReview",
              label: "New Review",
              desc: "When a learner submits a course review",
            },
            {
              key: "userRegistration",
              label: "User Registration",
              desc: "When a new user registers",
            },
            {
              key: "systemAlerts",
              label: "System Alerts",
              desc: "Critical system notifications",
            },
            {
              key: "weeklyDigest",
              label: "Weekly Digest",
              desc: "Weekly summary email to admins",
            },
            {
              key: "marketingEmails",
              label: "Marketing Emails",
              desc: "Promotional emails to users",
            },
          ].map((item, i) => (
            <div key={item.key}>
              {i > 0 && <Separator className="my-2" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={
                    notifications[item.key as keyof typeof notifications]
                  }
                  onCheckedChange={(v) =>
                    setNotifications({ ...notifications, [item.key]: v })
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Email Templates
          </CardTitle>
          <CardDescription>
            Customize email templates. Use {"{{name}}"}, {"{{course_name}}"},{" "}
            {"{{email}}"} as placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Welcome Email</Label>
              <Badge variant="outline" className="text-[10px]">
                Auto-sent on registration
              </Badge>
            </div>
            <Input
              value={templates.welcomeSubject}
              onChange={(e) =>
                setTemplates({ ...templates, welcomeSubject: e.target.value })
              }
              placeholder="Subject line"
              className="mb-2"
            />
            <Textarea
              value={templates.welcomeBody}
              onChange={(e) =>
                setTemplates({ ...templates, welcomeBody: e.target.value })
              }
              rows={5}
            />
          </div>
          <Separator />
          <div>
            <Label>Enrollment Confirmation Subject</Label>
            <Input
              value={templates.enrollmentSubject}
              onChange={(e) =>
                setTemplates({
                  ...templates,
                  enrollmentSubject: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label>Course Completion Subject</Label>
            <Input
              value={templates.completionSubject}
              onChange={(e) =>
                setTemplates({
                  ...templates,
                  completionSubject: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
