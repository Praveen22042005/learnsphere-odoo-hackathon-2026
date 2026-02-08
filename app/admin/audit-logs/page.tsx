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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  User,
  Shield,
  BookOpen,
  Users,
  Settings,
} from "lucide-react";

interface AuditEntry {
  id: string;
  type: string;
  description: string;
  user_name: string;
  user_avatar: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const typeIcons: Record<string, React.ElementType> = {
  enrollment: BookOpen,
  quiz_attempt: Shield,
  review: FileText,
  user_joined: Users,
  settings_change: Settings,
};

const typeColors: Record<string, string> = {
  enrollment:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  quiz_attempt:
    "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  review:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  user_joined:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  settings_change:
    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/activity?limit=100")
      .then((res) => res.json())
      .then((data) => setLogs(data.activities || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      search === "" ||
      log.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Audit Logs</h2>
        <p className="text-muted-foreground">
          Complete log of all platform actions and system events.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="enrollment">Enrollments</SelectItem>
                <SelectItem value="quiz_attempt">Quiz Attempts</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
                <SelectItem value="user_joined">User Registration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        {["enrollment", "quiz_attempt", "user_joined"].map((type) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {type.replace("_", " ")}s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter((l) => l.type === type).length}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Event Log
          </CardTitle>
          <CardDescription>{filteredLogs.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No audit log entries
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const Icon = typeIcons[log.type] || FileText;
                const colorClass =
                  typeColors[log.type] || "bg-muted text-muted-foreground";
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={log.user_avatar || ""} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{log.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize shrink-0"
                    >
                      {log.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
