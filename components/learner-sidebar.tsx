"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  LayoutDashboard,
  Compass,
  PlayCircle,
  Monitor,
  CircleHelp,
  TrendingUp,
  Star,
  Award,
  Trophy,
  MessageSquare,
  StarHalf,
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

const learnerSections = {
  main: [
    { title: "Dashboard", url: "/learner/dashboard", icon: LayoutDashboard },
    { title: "Browse Courses", url: "/learner/browse", icon: Compass },
    {
      title: "My Courses",
      url: "/learner/my-courses",
      icon: BookOpen,
    },
    { title: "Continue Learning", url: "/learner/continue", icon: PlayCircle },
  ],
  learning: [
    { title: "Lessons", url: "/learner/lessons", icon: Monitor },
    { title: "Quizzes", url: "/learner/quizzes", icon: CircleHelp },
    { title: "Progress Tracker", url: "/learner/progress", icon: TrendingUp },
  ],
  gamification: [
    { title: "Points", url: "/learner/points", icon: Star },
    { title: "Badges", url: "/learner/badges", icon: Award },
    { title: "Achievements", url: "/learner/achievements", icon: Trophy },
  ],
  interaction: [
    { title: "My Reviews", url: "/learner/reviews", icon: MessageSquare },
    { title: "Course Ratings", url: "/learner/ratings", icon: StarHalf },
  ],
};

export function LearnerSidebar({
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
    main: learnerSections.main.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    learning: learnerSections.learning.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    gamification: learnerSections.gamification.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    interaction: learnerSections.interaction.map((item) => ({
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
              <a href="/learner/dashboard" className="hover:bg-transparent">
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
                    Learning Dashboard
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Main" items={sectionsWithActive.main} />
        <NavSection label="Learning" items={sectionsWithActive.learning} />
        <NavSection
          label="Gamification"
          items={sectionsWithActive.gamification}
        />
        <NavSection
          label="Interaction"
          items={sectionsWithActive.interaction}
        />

        <SidebarSeparator className="mt-auto" />
        <SidebarGroup className="mt-auto py-2">
          <SidebarMenu className="gap-0">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-9">
                <a href="/learner/profile">
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
