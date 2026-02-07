"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  LayoutDashboard,
  PlusCircle,
  FileText,
  CircleHelp,
  Users,
  BarChart3,
  TrendingUp,
  UserPlus,
  Mail,
  User,
} from "lucide-react";

import { NavSection } from "@/components/nav-section";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const instructorSections = {
  main: [
    { title: "Dashboard", url: "/instructor/dashboard", icon: LayoutDashboard },
    { title: "My Courses", url: "/instructor/courses", icon: BookOpen },
    { title: "Create Course", url: "/instructor/create", icon: PlusCircle },
  ],
  courseManagement: [
    { title: "Lessons / Content", url: "/instructor/lessons", icon: FileText },
    { title: "Quizzes", url: "/instructor/quizzes", icon: CircleHelp },
    { title: "Attendees", url: "/instructor/attendees", icon: Users },
  ],
  analytics: [
    { title: "Course Reports", url: "/instructor/reports", icon: BarChart3 },
    {
      title: "Quiz Performance",
      url: "/instructor/quiz-performance",
      icon: TrendingUp,
    },
  ],
  communication: [
    { title: "Invite Learners", url: "/instructor/invite", icon: UserPlus },
    { title: "Contact Attendees", url: "/instructor/contact", icon: Mail },
  ],
};

export function InstructorSidebar({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const pathname = usePathname();

  // Add isActive to items based on current pathname
  const sectionsWithActive = {
    main: instructorSections.main.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    courseManagement: instructorSections.courseManagement.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    analytics: instructorSections.analytics.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    communication: instructorSections.communication.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b pb-4 mb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/instructor/dashboard" className="hover:bg-transparent">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="LearnSphere Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0 leading-tight">
                  <span className="font-semibold text-sm">LearnSphere</span>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground/60">
                    Instructor Panel
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Main" items={sectionsWithActive.main} />
        <NavSection
          label="Course Management"
          items={sectionsWithActive.courseManagement}
        />
        <NavSection label="Analytics" items={sectionsWithActive.analytics} />
        <NavSection
          label="Communication"
          items={sectionsWithActive.communication}
        />

        <SidebarSeparator className="mt-auto" />
        <SidebarGroup className="mt-auto py-2">
          <SidebarMenu className="gap-0">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-9">
                <a href="/instructor/profile">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">My Profile</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 h-9 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer overflow-hidden group">
                <UserButton
                  appearance={{
                    elements: {
                      rootBox: "shrink-0",
                      avatarBox: "w-4 h-4",
                      userButtonTrigger: "focus:shadow-none",
                    },
                  }}
                  userProfileMode="modal"
                />
                <span className="text-sm truncate">Account</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
