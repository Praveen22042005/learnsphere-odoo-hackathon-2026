"use client";

import { Mail, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InstructorContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Attendees</h1>
        <p className="text-sm text-muted-foreground">
          Communicate with your course attendees
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            In-app messaging and email notifications for attendees are being
            developed. For now, use the Invite Learners page to send course
            invitations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
