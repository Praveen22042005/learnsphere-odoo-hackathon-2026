"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  UserPlus,
  Send,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string | null;
}

export default function InstructorInvitePage() {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
          if (data.courses?.length > 0) setSelectedCourseId(data.courses[0].id);
        }
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    async function fetchInvitations() {
      setLoadingInvitations(true);
      try {
        const res = await fetch(`/api/courses/${selectedCourseId}/invitations`);
        if (res.ok) {
          const data = await res.json();
          setInvitations(data.invitations || []);
        }
      } catch {
        toast.error("Failed to load invitations");
      } finally {
        setLoadingInvitations(false);
      }
    }
    fetchInvitations();
  }, [selectedCourseId]);

  const handleSendInvitations = async () => {
    const emails = emailsInput
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) {
      toast.error("Enter at least one valid email address");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (!res.ok) throw new Error("Failed to send invitations");
      const data = await res.json();
      setInvitations((prev) => [...data.invitations, ...prev]);
      setEmailsInput("");
      toast.success(`${data.invitations.length} invitation(s) sent!`);
    } catch {
      toast.error("Failed to send invitations");
    } finally {
      setSending(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-amber-500" />;
      case "accepted":
        return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
      case "declined":
      case "expired":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invite Learners</h1>
          <p className="text-sm text-muted-foreground">
            Send course invitations to specific learners
          </p>
        </div>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Send Invitations
          </CardTitle>
          <CardDescription>
            Enter email addresses separated by commas or one per line
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Addresses</Label>
            <Textarea
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="john@example.com, jane@example.com..."
              className="min-h-24 resize-y"
            />
          </div>
          <Button
            onClick={handleSendInvitations}
            disabled={sending || !emailsInput.trim()}
            className="gap-1.5"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Sending..." : "Send Invitations"}
          </Button>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sent Invitations</CardTitle>
          <CardDescription>{invitations.length} invitation(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingInvitations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Mail className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No invitations sent yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-sm">
                      {inv.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(inv.status)}
                        <Badge variant="secondary" className="text-[10px]">
                          {inv.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.expires_at
                        ? new Date(inv.expires_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
