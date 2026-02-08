"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  User,
  BookOpen,
  GraduationCap,
  Star,
  UserPlus,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  user_name: string;
  user_avatar: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const activityIcons: Record<string, React.ElementType> = {
  enrollment: BookOpen,
  quiz_attempt: GraduationCap,
  review: Star,
  user_joined: UserPlus,
};

const activityColors: Record<string, string> = {
  enrollment: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  quiz_attempt:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  user_joined:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity?limit=50")
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by date
  const grouped: Record<string, ActivityItem[]> = {};
  activities.forEach((a) => {
    const date = new Date(a.created_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">User Activity</h2>
        <p className="text-muted-foreground">
          Track all user actions across the platform.
        </p>
      </div>

      {/* Activity Type Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(activityIcons).map(([type, Icon]) => (
          <Badge key={type} variant="outline" className="gap-1.5 capitalize">
            <Icon className="h-3.5 w-3.5" />
            {type.replace("_", " ")}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {date}
                </CardTitle>
                <CardDescription>{items.length} activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((activity) => {
                    const Icon = activityIcons[activity.type] || Activity;
                    const colorClass =
                      activityColors[activity.type] ||
                      "bg-muted text-muted-foreground";
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={activity.user_avatar || ""} />
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm">{activity.description}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {timeAgo(activity.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize shrink-0"
                        >
                          {activity.type.replace("_", " ")}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
