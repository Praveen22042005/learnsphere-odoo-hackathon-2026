import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/utils/supabase/admin";
import { CourseEditorClient } from "./course-editor-client";
import type { Course } from "@/types/course";
import type { Lesson } from "@/types/lesson";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseEditorPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const supabase = createServiceClient();

  // Resolve Supabase user from Clerk
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!userData) {
    redirect("/sign-in");
  }

  // Fetch course (verify ownership)
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("instructor_id", userData.id)
    .single();

  if (!course) {
    notFound();
  }

  // Fetch lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order_index", { ascending: true });

  return (
    <CourseEditorClient
      initialCourse={course as Course}
      initialLessons={(lessons || []) as Lesson[]}
    />
  );
}
