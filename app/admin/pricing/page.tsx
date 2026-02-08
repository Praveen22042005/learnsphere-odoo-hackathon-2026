"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tags, Plus, Pencil, Trash2, PercentCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PricingRule {
  id: string;
  name: string;
  type: "discount" | "bundle" | "coupon";
  value: number;
  isPercentage: boolean;
  active: boolean;
  description: string;
  appliesTo: string;
}

const defaultRules: PricingRule[] = [
  {
    id: "1",
    name: "Early Bird Discount",
    type: "discount",
    value: 20,
    isPercentage: true,
    active: true,
    description: "20% off for first 50 enrollments in any new course",
    appliesTo: "All new courses",
  },
  {
    id: "2",
    name: "Bundle: Complete Path",
    type: "bundle",
    value: 30,
    isPercentage: true,
    active: false,
    description: "30% off when enrolling in 3+ courses in the same category",
    appliesTo: "Category bundles",
  },
  {
    id: "3",
    name: "WELCOME50",
    type: "coupon",
    value: 50,
    isPercentage: true,
    active: true,
    description: "50% welcome coupon for new learners",
    appliesTo: "First enrollment",
  },
];

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>(defaultRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule, setEditRule] = useState<PricingRule | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "discount" as PricingRule["type"],
    value: 0,
    isPercentage: true,
    description: "",
    appliesTo: "",
  });

  const openNew = () => {
    setEditRule(null);
    setForm({
      name: "",
      type: "discount",
      value: 0,
      isPercentage: true,
      description: "",
      appliesTo: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditRule(rule);
    setForm({
      name: rule.name,
      type: rule.type,
      value: rule.value,
      isPercentage: rule.isPercentage,
      description: rule.description,
      appliesTo: rule.appliesTo,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editRule) {
      setRules((prev) =>
        prev.map((r) => (r.id === editRule.id ? { ...r, ...form } : r)),
      );
    } else {
      setRules((prev) => [
        ...prev,
        { id: Date.now().toString(), ...form, active: true },
      ]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      discount: "default",
      bundle: "secondary",
      coupon: "outline",
    };
    return (
      <Badge variant={variants[type] || "outline"} className="capitalize">
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Pricing Rules</h2>
          <p className="text-muted-foreground">
            Manage discounts, bundles, and coupon codes.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {/* Active Rules Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <PercentCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rules.filter((r) => r.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <PercentCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {rules.filter((r) => !r.active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            All Pricing Rules
          </CardTitle>
          <CardDescription>
            Configure discounts, bundles, and promotional coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(rule.type)}</TableCell>
                    <TableCell className="font-medium">
                      {rule.isPercentage ? `${rule.value}%` : `$${rule.value}`}
                    </TableCell>
                    <TableCell className="text-sm">{rule.appliesTo}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleActive(rule.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {rules.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No pricing rules configured
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editRule ? "Edit Rule" : "New Pricing Rule"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the rule"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isPercentage}
                    onCheckedChange={(v) =>
                      setForm({ ...form, isPercentage: v })
                    }
                  />
                  <Label>
                    {form.isPercentage ? "Percentage" : "Fixed Amount"}
                  </Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Applies To</Label>
              <Input
                value={form.appliesTo}
                onChange={(e) =>
                  setForm({ ...form, appliesTo: e.target.value })
                }
                placeholder="e.g., All courses, First enrollment"
              />
            </div>
            <Separator />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editRule ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
