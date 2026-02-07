"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSection({
  label,
  items,
}: {
  label: string;
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1 px-2">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={item.isActive}
              className="h-9 data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-accent/50"
            >
              <a
                href={item.url}
                className="flex items-center gap-2 overflow-hidden"
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
