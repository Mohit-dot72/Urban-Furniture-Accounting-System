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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const accountSchema = z.object({
  name: z.string().min(1, "Name required"),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  category: z.string().optional(),
  code: z.string().optional(),
});
type AccountForm = z.infer<typeof accountSchema>;

const typeColors: Record<string, string> = {
  ASSET: "bg-blue-100 text-blue-700",
  LIABILITY: "bg-red-100 text-red-700",
  EQUITY: "bg-purple-100 text-purple-700",
  REVENUE: "bg-emerald-100 text-emerald-700",
  EXPENSE: "bg-orange-100 text-orange-700",
};

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: "ASSET" },
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const openAdd = () => { setEditing(null); reset({ name: "", type: "ASSET", category: "", code: "" }); setOpen(true); };
  const openEdit = (a: any) => { setEditing(a); reset({ name: a.name, type: a.type, category: a.category || "", code: a.code || "" }); setOpen(true); };

  const onSubmit = async (data: AccountForm) => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/accounts/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error("Failed to save account", err);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    try {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete account", err);
    }
  };

  const filtered = accounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chart of Accounts</h1>
        <Button size="sm" onClick={openAdd} className="gap-1.5"><Plus size={15} /> New Account</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
        <Input placeholder="Search accounts..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Code</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Account Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block mr-2" size={16} />
                  <span className="text-sm text-muted-foreground">Loading accounts...</span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  No accounts found. Click &quot;New Account&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs font-mono text-muted-foreground">{a.code || "—"}</TableCell>
                  <TableCell className="font-medium text-sm py-3">{a.name}</TableCell>
                  <TableCell><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[a.type]}`}>{a.type}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.category || "—"}</TableCell>
                  <TableCell><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{a.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}><Pencil size={13} className="text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => del(a.id)}><Trash2 size={13} className="text-red-400" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">Showing {filtered.length} of {accounts.length} entries</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Account" : "New Account"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Account Name *</label>
              <Input {...register("name")} className="h-9 text-sm" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
                <Select defaultValue={editing?.type || "ASSET"} onValueChange={(v) => setValue("type", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["ASSET","LIABILITY","EQUITY","REVENUE","EXPENSE"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Code</label>
                <Input {...register("code")} placeholder="e.g. 1001" className="h-9 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <Input {...register("category")} placeholder="e.g. Current Asset" className="h-9 text-sm" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <><Loader2 className="animate-spin mr-1" size={14} /> Saving...</> : editing ? "Update" : "Save Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
