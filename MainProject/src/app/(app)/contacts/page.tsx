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
import { Plus, Search, Filter, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]),
  email: z.string().email().optional().or(z.literal("")),
  mobile: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  address: z.string().optional(),
  gstNo: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const typeLabels: Record<string, { label: string; className: string }> = {
  CUSTOMER: { label: "Customer", className: "bg-blue-100 text-blue-700" },
  VENDOR: { label: "Vendor", className: "bg-purple-100 text-purple-700" },
  BOTH: { label: "Both", className: "bg-teal-100 text-teal-700" },
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "CUSTOMER" | "VENDOR">("all");
  const [open, setOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: "CUSTOMER" },
  });

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const openAdd = () => {
    setEditingContact(null);
    reset({ type: "CUSTOMER" });
    setOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingContact(c);
    reset(c);
    setOpen(true);
  };

  const onSubmit = async (data: ContactForm) => {
    setSaving(true);
    try {
      if (editingContact) {
        await fetch(`/api/contacts/${editingContact.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setOpen(false);
      fetchContacts();
    } catch (err) {
      console.error("Failed to save contact", err);
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/contacts/${deleteTarget.id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete contact", err);
    }
  };

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search);
    const matchTab = tab === "all" || c.type === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus size={15} /> New Contact
        </Button>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {(["all", "CUSTOMER", "VENDOR"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
              tab === t ? "bg-card shadow-none text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "all" ? "All" : t === "CUSTOMER" ? "Customers" : "Vendors"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input placeholder="Search contacts..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter size={13} /> Filter
        </Button>
      </div>

      <div className="bg-card rounded-xl border-0 shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/80 hover:bg-muted/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Mobile</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">City</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block mr-2" size={16} />
                  <span className="text-sm text-muted-foreground">Loading contacts...</span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10 text-sm">
                  No contacts found. Click &quot;New Contact&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((contact) => {
                const typeStyle = typeLabels[contact.type] || typeLabels.CUSTOMER;
                return (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-sm flex items-center gap-2.5 py-3">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      {contact.name}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeStyle.className}`}>
                        {typeStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{contact.email || "—"}</TableCell>
                    <TableCell className="text-xs">{contact.mobile || "—"}</TableCell>
                    <TableCell className="text-xs">{contact.city || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${contact.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-muted/50 text-muted-foreground"}`}>
                        {contact.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(contact)}>
                          <Pencil size={13} className="text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(contact)}>
                          <Trash2 size={13} className="text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">
          Showing {filtered.length} of {contacts.length} entries
        </div>
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
              Are you sure you want to permanently delete contact <strong className="text-foreground">{deleteTarget?.name}</strong>?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
              ⚠️ Warning: This record will be permanently deleted and cannot be recovered.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                <Input {...register("name")} placeholder="Contact name" className="h-9 text-sm" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
                <Select defaultValue={editingContact?.type || "CUSTOMER"} onValueChange={(v) => setValue("type", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input {...register("email")} placeholder="email@example.com" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile</label>
                <Input {...register("mobile")} placeholder="Mobile number" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">GST No.</label>
                <Input {...register("gstNo")} placeholder="GST Number" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                <Input {...register("city")} placeholder="City" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">State</label>
                <Input {...register("state")} placeholder="State" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Pincode</label>
                <Input {...register("pincode")} placeholder="Pincode" className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                <Input {...register("address")} placeholder="Full address" className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <><Loader2 className="animate-spin mr-1" size={14} /> Saving...</> : editingContact ? "Update Contact" : "Save Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
