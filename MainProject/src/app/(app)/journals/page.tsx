"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { Plus, Search, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const journalSchema = z.object({
  name: z.string().min(1, "Name required"),
  type: z.enum(["SALES", "PURCHASE", "BANK", "CASH", "GENERAL"]),
});
type JournalForm = z.infer<typeof journalSchema>;

const typeColors: Record<string, string> = {
  SALES: "bg-emerald-100 text-emerald-700",
  PURCHASE: "bg-orange-100 text-orange-700",
  BANK: "bg-blue-100 text-blue-700",
  CASH: "bg-purple-100 text-purple-700",
  GENERAL: "bg-muted/50 text-foreground",
};

export default function JournalsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JournalForm>({
    resolver: zodResolver(journalSchema),
    defaultValues: { type: "SALES" },
  });

  const fetchJournals = useCallback(async () => {
    try {
      const res = await fetch("/api/journals");
      const data = await res.json();
      setJournals(data);
    } catch (err) {
      console.error("Failed to fetch journals", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJournals(); }, [fetchJournals]);

  const openAdd = () => { setEditing(null); reset({ name: "", type: "SALES" }); setOpen(true); };
  const openEdit = (j: any) => { setEditing(j); reset({ name: j.name, type: j.type }); setOpen(true); };

  const onSubmit = async (data: JournalForm) => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/journals/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/journals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setOpen(false);
      fetchJournals();
    } catch (err) {
      console.error("Failed to save journal", err);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/journals/${deleteTarget.id}`, { method: "DELETE" });
      setJournals((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete journal", err);
    }
  };

  const filtered = journals.filter((j) => j.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Journals</h1>
          <p className="text-xs text-muted-foreground">Manage journal master categories & double-entry posting ledgers</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs">View Journal Entries</Button>
          </Link>
          <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus size={15} /> New Journal</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input placeholder="Search journals..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Journal Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block mr-2" size={16} />
                  <span className="text-sm text-muted-foreground">Loading journals...</span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                  No journals found. Click &quot;New Journal&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((j) => (
                <TableRow key={j.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-sm py-3">{j.name}</TableCell>
                  <TableCell><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[j.type]}`}>{j.type}</span></TableCell>
                  <TableCell><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{j.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(j)}><Pencil size={13} className="text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(j)}><Trash2 size={13} className="text-red-400" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">Showing {filtered.length} of {journals.length} entries</div>
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
              Are you sure you want to permanently delete journal <strong className="text-foreground">{deleteTarget?.name}</strong>?
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Journal" : "New Journal"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Journal Name *</label>
              <Input {...register("name")} className="h-9 text-sm" placeholder="e.g. Sales Journal" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
              <Select defaultValue={editing?.type || "SALES"} onValueChange={(v) => setValue("type", v as any)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["SALES","PURCHASE","BANK","CASH","GENERAL"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <><Loader2 className="animate-spin mr-1" size={14} /> Saving...</> : editing ? "Update" : "Save Journal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
