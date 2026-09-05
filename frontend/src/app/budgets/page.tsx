"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
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

const mockBudgets = [
  { id: "1", name: "Sales Budget", accountName: "Sales Income", analyticAccount: "Sales Dept", startDate: "Apr 2025", endDate: "Mar 2026", plannedAmount: 1200000, responsible: "Mohit Kumar" },
  { id: "2", name: "Salary Budget", accountName: "Salary Expense", analyticAccount: "HR Dept", startDate: "Apr 2025", endDate: "Mar 2026", plannedAmount: 480000, responsible: "Mohit Kumar" },
  { id: "3", name: "Rent Expense", accountName: "Rent Expense", analyticAccount: "Admin Dept", startDate: "Apr 2025", endDate: "Mar 2026", plannedAmount: 300000, responsible: "Mohit Kumar" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function BudgetsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [budgets, setBudgets] = useState(mockBudgets);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
  });

  const onSubmit = (data: BudgetForm) => {
    setBudgets((prev) => [...prev, { id: String(Date.now()), ...data, responsible: "Mohit Kumar" } as any]);
    setOpen(false);
    reset();
  };

  const filtered = budgets.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Budgets</h1>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5"><Plus size={15} /> New Budget</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input placeholder="Search budgets..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Budget Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Analytic Account</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Date Range</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Responsible</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Planned Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-sm py-3">{b.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.analyticAccount}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{b.startDate} – {b.endDate}</TableCell>
                <TableCell className="text-xs">{b.responsible}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(b.plannedAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
              <Button type="submit" size="sm">Save Budget</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
