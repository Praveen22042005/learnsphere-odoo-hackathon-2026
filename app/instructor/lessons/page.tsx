"use client";

import { FileText, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InstructorLessonsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lessons / Content</h1>
        <p className="text-sm text-muted-foreground">
          Manage lesson content from within each course editor
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Lesson Management</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Lessons are managed within each course&apos;s Content tab. Navigate
            to a course editor to add, edit, reorder, or delete lessons.
          </p>
          <Button
            onClick={() => router.push("/instructor/courses")}
            className="gap-1.5"
          >
            <BookOpen className="h-4 w-4" />
            Go to My Courses
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
