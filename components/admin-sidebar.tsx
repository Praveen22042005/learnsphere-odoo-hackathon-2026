"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, BookOpen, Users, CheckSquare } from "lucide-react";

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

const adminSections = {
  overview: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "User Mgmt", url: "/admin/users", icon: Users },
  ],
  content: [
    { title: "All Courses", url: "/admin/courses", icon: BookOpen },
    { title: "Approvals", url: "/admin/approvals", icon: CheckSquare },
  ],
};

export function AdminSidebar({
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
    overview: adminSections.overview.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    content: adminSections.content.map((item) => ({
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
              <a href="/admin/dashboard" className="hover:bg-transparent">
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
                    Admin Console
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Overview" items={sectionsWithActive.overview} />
        <NavSection label="Content" items={sectionsWithActive.content} />

        <SidebarSeparator className="mt-auto" />
        <SidebarGroup className="mt-auto py-2">
          <SidebarMenu className="gap-0">
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
                <span className="text-sm truncate">Profile</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
