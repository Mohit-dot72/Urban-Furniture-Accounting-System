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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const accounts = ["Cash", "Bank", "Debtors", "Creditors", "Sales Income", "Purchase Expense", "Salary Expense", "Rent Expense"];

const lineSchema = z.object({
  account: z.string().min(1),
  description: z.string().optional(),
  debit: z.coerce.number().min(0),
  credit: z.coerce.number().min(0),
});

const entrySchema = z.object({
  journal: z.string().min(1),
  date: z.string().min(1),
  reference: z.string().optional(),
  narration: z.string().optional(),
  lines: z.array(lineSchema).min(2),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total Debits must equal Total Credits", path: ["lines"] }
);

type EntryForm = z.infer<typeof entrySchema>;

const mockEntries = [
  { id: "1", entryNo: "JE/2025/027", journal: "Sales Journal", date: "28 May 2025", reference: "INV/2025/076", totalDebit: 125000, totalCredit: 125000 },
  { id: "2", entryNo: "JE/2025/028", journal: "Purchase Journal", date: "27 May 2025", reference: "BILL/2025/055", totalDebit: 75000, totalCredit: 75000 },
  { id: "3", entryNo: "JE/2025/029", journal: "Bank Journal", date: "26 May 2025", reference: "PY/2025/033", totalDebit: 125000, totalCredit: 125000 },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState(mockEntries);

  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      journal: "Sales Journal",
      date: new Date().toISOString().split("T")[0],
      lines: [
        { account: "", description: "", debit: 0, credit: 0 },
        { account: "", description: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines = watch("lines");
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const onSubmit = (data: EntryForm) => {
    const newEntry = {
      id: String(Date.now()),
      entryNo: `JE/2025/${String(entries.length + 30).padStart(3, "0")}`,
      journal: data.journal,
      date: data.date,
      reference: data.reference || "",
      totalDebit,
      totalCredit,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setOpen(false);
    reset();
  };

  const filtered = entries.filter((e) =>
    e.entryNo.toLowerCase().includes(search.toLowerCase()) ||
    e.journal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Journal Entries</h1>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5"><Plus size={15} /> New Entry</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input placeholder="Search entries..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Entry No.</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Journal</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Debit</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs text-blue-600 font-medium py-3">{e.entryNo}</TableCell>
                <TableCell className="text-sm">{e.journal}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.date}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.reference}</TableCell>
                <TableCell className="text-xs text-right font-semibold text-red-600">₹ {fmt(e.totalDebit)}</TableCell>
                <TableCell className="text-xs text-right font-semibold text-emerald-600">₹ {fmt(e.totalCredit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New Entry Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Journal *</label>
                <select {...register("journal")} className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  {["Sales Journal", "Purchase Journal", "Bank Journal", "Cash Journal", "General Journal"].map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
                <Input type="date" {...register("date")} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference</label>
                <Input {...register("reference")} placeholder="e.g. INV/2025/001" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Narration</label>
              <Input {...register("narration")} placeholder="Description of this entry..." className="h-9 text-sm" />
            </div>

            {/* Journal Lines */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Account</th>
                    <th className="text-left px-3 py-2 font-semibold">Description</th>
                    <th className="text-right px-3 py-2 font-semibold w-28">Debit (₹)</th>
                    <th className="text-right px-3 py-2 font-semibold w-28">Credit (₹)</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, i) => (
                    <tr key={field.id} className="border-t">
                      <td className="px-2 py-1.5">
                        <select {...register(`lines.${i}.account`)} className="w-full h-8 text-xs border border-input rounded px-2 bg-background">
                          <option value="">Select account</option>
                          {accounts.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input {...register(`lines.${i}.description`)} placeholder="Description" className="h-8 text-xs" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input {...register(`lines.${i}.debit`)} type="number" step="0.01" placeholder="0.00" className="h-8 text-xs text-right" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input {...register(`lines.${i}.credit`)} type="number" step="0.01" placeholder="0.00" className="h-8 text-xs text-right" />
                      </td>
                      <td className="px-1 py-1.5">
                        {fields.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(i)}>
                            <Trash2 size={12} className="text-red-400" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted border-t">
                  <tr>
                    <td colSpan={2} className="px-3 py-2">
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => append({ account: "", description: "", debit: 0, credit: 0 })}>
                        <Plus size={12} /> Add Line
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-bold">
                      ₹ {fmt(totalDebit)}
                    </td>
                    <td className={`px-3 py-2 text-right text-xs font-bold ${isBalanced ? "text-emerald-600" : "text-red-500"}`}>
                      ₹ {fmt(totalCredit)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {!isBalanced && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-md px-3 py-2">
                ⚠ Total Debits (₹{fmt(totalDebit)}) must equal Total Credits (₹{fmt(totalCredit)}) before posting.
              </p>
            )}

            {(errors as any).lines && (
              <p className="text-red-500 text-xs">{(errors as any).lines.message}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!isBalanced}>Post Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
