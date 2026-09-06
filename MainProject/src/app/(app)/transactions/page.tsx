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
import { Plus, Search, Trash2, Loader2, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const lineSchema = z.object({
  accountId: z.string().min(1, "Account required"),
  description: z.string().optional(),
  debit: z.coerce.number().min(0),
  credit: z.coerce.number().min(0),
});

const entrySchema = z.object({
  journalId: z.string().min(1, "Journal required"),
  date: z.string().min(1, "Date required"),
  reference: z.string().optional(),
  narration: z.string().optional(),
  lines: z.array(lineSchema).min(2, "At least 2 lines required"),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total Debits must equal Total Credits", path: ["lines"] }
);

type EntryForm = z.infer<typeof entrySchema>;

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n || 0);
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<any>(null);

  const [entries, setEntries] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [resEntries, resJournals, resAccounts] = await Promise.all([
        fetch("/api/journal-entries"),
        fetch("/api/journals"),
        fetch("/api/accounts"),
      ]);

      const [dataEntries, dataJournals, dataAccounts] = await Promise.all([
        resEntries.json(),
        resJournals.json(),
        resAccounts.json(),
      ]);

      setEntries(Array.isArray(dataEntries) ? dataEntries : []);
      setJournals(Array.isArray(dataJournals) ? dataJournals : []);
      setAccounts(Array.isArray(dataAccounts) ? dataAccounts : []);
    } catch (err) {
      console.error("Failed to load journal entries data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const { register, handleSubmit, control, watch, formState: { errors }, reset, setValue } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      journalId: "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      narration: "",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const lines = watch("lines");
  const totalDebit = (lines || []).reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = (lines || []).reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && (totalDebit > 0 || totalCredit > 0);

  const handleOpenAdd = () => {
    reset({
      journalId: journals.length > 0 ? journals[0].id : "",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      narration: "",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    });
    setOpen(true);
  };

  const onSubmit = async (data: EntryForm) => {
    setSaving(true);
    try {
      const res = await fetch("/api/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to create journal entry");
        return;
      }

      setOpen(false);
      reset();
      fetchAllData();
    } catch (err) {
      console.error("Failed to save entry", err);
      alert("Error saving journal entry");
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/journal-entries/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete entry", err);
    }
  };

  const filtered = entries.filter((e) =>
    (e.entryNo || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.journal?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.narration || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.reference || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Journal Entries</h1>
          <p className="text-xs text-muted-foreground">Record and track double-entry accounting transactions</p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
          <Plus size={15} /> New Entry
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input
          placeholder="Search entry no, journal, narration..."
          className="pl-8 h-8 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Entry No.</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Journal</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Reference / Narration</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Debit</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Credit</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin inline-block mr-2" size={16} /> Loading journal entries...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  No journal entries found. Click &quot;New Entry&quot; to post a new double-entry transaction.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-blue-600 font-semibold py-3">
                    {e.entryNo}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {e.journal?.name || "General Journal"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.date ? new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate">
                    <span className="font-medium text-foreground">{e.reference || "N/A"}</span>
                    {e.narration && <span className="text-muted-foreground block text-[11px] truncate">{e.narration}</span>}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold text-red-600">
                    ₹ {fmt(e.totalDebit)}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold text-emerald-600">
                    ₹ {fmt(e.totalCredit)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewingEntry(e)}
                        title="View Details"
                      >
                        <Eye size={13} className="text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDeleteTarget(e)}
                        title="Delete Entry"
                      >
                        <Trash2 size={13} className="text-red-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">
          Showing {filtered.length} of {entries.length} journal entries
        </div>
      </div>

      {/* Delete Warning Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={20} /> Permanent Deletion Warning
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              Are you sure you want to permanently delete journal entry <strong className="text-foreground">{deleteTarget?.entryNo}</strong>?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
              ⚠️ Warning: This double-entry transaction will be permanently deleted and cannot be recovered.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Entry Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Journal Master *</label>
                <select
                  {...register("journalId")}
                  className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Journal</option>
                  {journals.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name} ({j.type})
                    </option>
                  ))}
                </select>
                {errors.journalId && <p className="text-red-500 text-[11px] mt-1">{errors.journalId.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Posting Date *</label>
                <Input type="date" {...register("date")} className="h-9 text-sm" />
                {errors.date && <p className="text-red-500 text-[11px] mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference</label>
                <Input {...register("reference")} placeholder="e.g. INV/2025/001 or RCPT/022" className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Narration / Description</label>
              <Input {...register("narration")} placeholder="Reason or memo for this journal transaction..." className="h-9 text-sm" />
            </div>

            {/* Journal Lines Table */}
            <div className="border rounded-lg overflow-hidden bg-background">
              <table className="w-full text-xs">
                <thead className="bg-muted/70 text-muted-foreground border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold w-1/3">Account *</th>
                    <th className="text-left px-3 py-2 font-semibold">Description</th>
                    <th className="text-right px-3 py-2 font-semibold w-32">Debit (₹)</th>
                    <th className="text-right px-3 py-2 font-semibold w-32">Credit (₹)</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, i) => (
                    <tr key={field.id} className="border-t border-muted/50 hover:bg-muted/20">
                      <td className="px-2 py-1.5">
                        <select
                          {...register(`lines.${i}.accountId`)}
                          className="w-full h-8 text-xs border border-input rounded px-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Select Account</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code ? `[${a.code}] ` : ""}{a.name} ({a.type})
                            </option>
                          ))}
                        </select>
                        {(errors.lines as any)?.[i]?.accountId && (
                          <p className="text-red-500 text-[10px]">Required</p>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <Input {...register(`lines.${i}.description`)} placeholder="Line note" className="h-8 text-xs" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          {...register(`lines.${i}.debit`)}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-8 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          {...register(`lines.${i}.credit`)}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-8 text-xs text-right font-mono"
                        />
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        {fields.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(i)}>
                            <Trash2 size={12} className="text-red-400 hover:text-red-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/60 border-t">
                  <tr>
                    <td colSpan={2} className="px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 bg-background"
                        onClick={() => append({ accountId: "", description: "", debit: 0, credit: 0 })}
                      >
                        <Plus size={12} /> Add Line
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-right font-bold font-mono text-xs">
                      ₹ {fmt(totalDebit)}
                    </td>
                    <td className={`px-3 py-2 text-right font-bold font-mono text-xs ${isBalanced ? "text-emerald-600" : "text-red-500"}`}>
                      ₹ {fmt(totalCredit)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Validation & Double Entry Balance Indicator */}
            {isBalanced ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                <span>Entry is balanced! Total Debits equal Total Credits (₹{fmt(totalDebit)}).</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle size={14} className="shrink-0 text-red-500" />
                <span>
                  Unbalanced Entry! Total Debits (₹{fmt(totalDebit)}) must equal Total Credits (₹{fmt(totalCredit)}). Difference: ₹{fmt(Math.abs(totalDebit - totalCredit))}.
                </span>
              </div>
            )}

            {(errors as any).lines && (
              <p className="text-red-500 text-xs">{(errors as any).lines.message}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving || !isBalanced} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin mr-1.5" size={14} /> Posting Entry...
                  </>
                ) : (
                  "Post Entry"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Entry Details Modal */}
      {viewingEntry && (
        <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Journal Entry: {viewingEntry.entryNo}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {viewingEntry.date ? new Date(viewingEntry.date).toLocaleDateString("en-IN") : ""}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-lg border">
                <div>
                  <p className="text-muted-foreground font-medium">Journal Master</p>
                  <p className="font-semibold text-sm">{viewingEntry.journal?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Reference</p>
                  <p className="font-semibold text-sm">{viewingEntry.reference || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground font-medium">Narration</p>
                  <p className="italic text-foreground">{viewingEntry.narration || "No narration provided"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-xs">Accounting Lines</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted border-b">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Account</th>
                        <th className="text-left px-3 py-2 font-semibold">Description</th>
                        <th className="text-right px-3 py-2 font-semibold">Debit (₹)</th>
                        <th className="text-right px-3 py-2 font-semibold">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingEntry.lines?.map((line: any) => (
                        <tr key={line.id} className="border-t">
                          <td className="px-3 py-2 font-medium">
                            {line.account?.code ? `[${line.account.code}] ` : ""}{line.account?.name || "Account"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{line.description || "-"}</td>
                          <td className="px-3 py-2 text-right font-mono text-red-600 font-medium">
                            {line.debit > 0 ? `₹ ${fmt(line.debit)}` : "-"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600 font-medium">
                            {line.credit > 0 ? `₹ ${fmt(line.credit)}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted font-bold border-t">
                      <tr>
                        <td colSpan={2} className="px-3 py-2">Total</td>
                        <td className="px-3 py-2 text-right font-mono text-red-600">₹ {fmt(viewingEntry.totalDebit)}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-600">₹ {fmt(viewingEntry.totalCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setViewingEntry(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
