import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/roles";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user.publicMetadata as any)?.role;
  if (role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }

  const userData = {
    name: user.firstName || user.emailAddresses[0]?.emailAddress || "Admin",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
  };

  return (
    <SidebarProvider>
      <AdminSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Badge variant="outline" className="text-xs font-medium">
            Admin
          </Badge>
          <div className="relative ml-4 hidden flex-1 md:block md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, users..."
              className="pl-8"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right text-sm sm:block">
              <p className="text-xs text-muted-foreground">Welcome,</p>
              <p className="font-medium leading-tight">{userData.name}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatar} alt={userData.name} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
