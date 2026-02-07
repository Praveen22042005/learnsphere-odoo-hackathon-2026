"use client";

import { UserButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ userName }: { userName: string }) {
  const router = useRouter();

  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome to LearnSphere Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">Hello, {userName}! 👋</p>
      </div>
      <div className="flex items-center gap-3">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10",
            },
          }}
        />
      </div>
    </div>
  );
}
