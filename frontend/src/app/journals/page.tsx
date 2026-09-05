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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const journalSchema = z.object({
  name: z.string().min(1, "Name required"),
  type: z.enum(["SALES", "PURCHASE", "BANK", "CASH", "GENERAL"]),
});
type JournalForm = z.infer<typeof journalSchema>;

const mockJournals = [
  { id: "1", name: "Sales Journal", type: "SALES", relatedAccounts: "Debtors, Sales Income", status: "Active" },
  { id: "2", name: "Purchase Journal", type: "PURCHASE", relatedAccounts: "Creditors, Purchase Expense", status: "Active" },
  { id: "3", name: "Bank Journal", type: "BANK", relatedAccounts: "Bank, Various Accounts", status: "Active" },
  { id: "4", name: "Cash Journal", type: "CASH", relatedAccounts: "Cash, Various Accounts", status: "Active" },
];

const typeColors: Record<string, string> = {
  SALES: "bg-emerald-100 text-emerald-700",
  PURCHASE: "bg-orange-100 text-orange-700",
  BANK: "bg-blue-100 text-blue-700",
  CASH: "bg-purple-100 text-purple-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

export default function JournalsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [journals, setJournals] = useState(mockJournals);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JournalForm>({
    resolver: zodResolver(journalSchema),
    defaultValues: { type: "SALES" },
  });

  const openAdd = () => { setEditing(null); reset({ type: "SALES" }); setOpen(true); };
  const openEdit = (j: any) => { setEditing(j); reset(j); setOpen(true); };
  const onSubmit = (data: JournalForm) => {
    if (editing) {
      setJournals((prev) => prev.map((j) => j.id === editing.id ? { ...j, ...data } : j));
    } else {
      setJournals((prev) => [...prev, { id: String(Date.now()), ...data, relatedAccounts: "", status: "Active" } as any]);
    }
    setOpen(false);
  };
  const del = (id: string) => setJournals((prev) => prev.filter((j) => j.id !== id));
  const filtered = journals.filter((j) => j.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Journals</h1>
        <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus size={15} /> New Journal</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input placeholder="Search journals..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Journal Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Related Accounts</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((j) => (
              <TableRow key={j.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-sm py-3">{j.name}</TableCell>
                <TableCell><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[j.type]}`}>{j.type}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{j.relatedAccounts}</TableCell>
                <TableCell><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{j.status}</span></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(j)}><Pencil size={13} className="text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => del(j.id)}><Trash2 size={13} className="text-red-400" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Journal" : "New Journal"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Journal Name *</label>
              <Input {...register("name")} className="h-9 text-sm" placeholder="e.g. Sales Journal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
              <Select defaultValue="SALES" onValueChange={(v) => setValue("type", v as any)}>
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
              <Button type="submit" size="sm">{editing ? "Update" : "Save Journal"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
