"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const budgetSchema = z.object({
  name: z.string().min(1),
  accountName: z.string().min(1),
  analyticAccount: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  plannedAmount: z.coerce.number().min(0),
});
type BudgetForm = z.infer<typeof budgetSchema>;

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export default function BudgetsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
  });

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets");
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const onSubmit = async (data: BudgetForm) => {
    setSaving(true);
    try {
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setOpen(false);
      reset();
      fetchBudgets();
    } catch (err) {
      console.error("Failed to save budget", err);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/budgets/${deleteTarget.id}`, { method: "DELETE" });
      setBudgets((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete budget", err);
    }
  };

  const filtered = budgets.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Budgets</h1>
        <Button size="sm" onClick={() => { reset(); setOpen(true); }} className="gap-1.5"><Plus size={15} /> New Budget</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input placeholder="Search budgets..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Budget Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Account</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Analytic Account</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Date Range</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Planned Amount</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block mr-2" size={16} />
                  <span className="text-sm text-muted-foreground">Loading budgets...</span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  No budgets found. Click &quot;New Budget&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-sm py-3">{b.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.accountName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.analyticAccount || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(b.startDate)} – {fmtDate(b.endDate)}</TableCell>
                  <TableCell className="text-xs text-right font-semibold">{fmt(b.plannedAmount)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(b)}>
                      <Trash2 size={13} className="text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">Showing {filtered.length} of {budgets.length} entries</div>
      </div>

      {/* Delete Warning Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} /> Permanent Deletion Warning
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              Are you sure you want to permanently delete budget <strong className="text-foreground">{deleteTarget?.name}</strong>?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
              ⚠️ Warning: This record will be permanently deleted from the PostgreSQL database and cannot be recovered.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Budget</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Budget Name *</label>
                <Input {...register("name")} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Budget Account *</label>
                <Input {...register("accountName")} placeholder="e.g. Salary Expense" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Analytic Account</label>
                <Input {...register("analyticAccount")} placeholder="e.g. HR Dept" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date *</label>
                <Input type="date" {...register("startDate")} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date *</label>
                <Input type="date" {...register("endDate")} className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Planned Amount *</label>
                <Input {...register("plannedAmount")} type="number" placeholder="0.00" className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <><Loader2 className="animate-spin mr-1" size={14} /> Saving...</> : "Save Budget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
