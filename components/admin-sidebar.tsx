"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShieldCheck,
  BarChart3,
  Activity,
  TrendingUp,
  CreditCard,
  Tags,
  Settings,
  Bell,
  FileText,
  UserCircle,
  LogOut,
} from "lucide-react";

import { NavSection } from "@/components/nav-section";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const adminSections = {
  main: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  ],
  platform: [
    { title: "All Courses", url: "/admin/courses", icon: BookOpen },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Roles & Permissions", url: "/admin/roles", icon: ShieldCheck },
  ],
  analytics: [
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "User Activity", url: "/admin/activity", icon: Activity },
    {
      title: "Completion Analytics",
      url: "/admin/completions",
      icon: TrendingUp,
    },
  ],
  business: [
    { title: "Payments", url: "/admin/payments", icon: CreditCard },
    { title: "Pricing Rules", url: "/admin/pricing", icon: Tags },
  ],
  system: [
    { title: "Website Settings", url: "/admin/settings", icon: Settings },
    { title: "Email & Notifications", url: "/admin/notifications", icon: Bell },
    { title: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
  ],
};

function addActiveState(items: typeof adminSections.main, pathname: string) {
  return items.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
  }));
}

export function AdminSidebar({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const sections = {
    main: addActiveState(adminSections.main, pathname),
    platform: addActiveState(adminSections.platform, pathname),
    analytics: addActiveState(adminSections.analytics, pathname),
    business: addActiveState(adminSections.business, pathname),
    system: addActiveState(adminSections.system, pathname),
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
        <NavSection label="" items={sections.main} />
        <NavSection label="Platform Management" items={sections.platform} />
        <NavSection label="Analytics" items={sections.analytics} />
        <NavSection label="Business" items={sections.business} />
        <NavSection label="System" items={sections.system} />

        <SidebarSeparator className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t pt-2">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin/profile"}
              className="h-9 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-accent/50"
            >
              <a
                href="/admin/profile"
                className="flex items-center gap-2 overflow-hidden"
              >
                <UserCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">Admin Profile</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-9 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup className="py-1">
          <SidebarMenu className="gap-0">
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 h-9 rounded-md overflow-hidden">
                <UserButton
                  appearance={{
                    elements: {
                      rootBox: "shrink-0",
                      avatarBox: "w-6 h-6",
                      userButtonTrigger: "focus:shadow-none",
                    },
                  }}
                  userProfileMode="modal"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
