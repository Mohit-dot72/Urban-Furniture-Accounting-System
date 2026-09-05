"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Pencil, Trash2 } from "lucide-react";
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

const mockContacts = [
  { id: "1", name: "Azure Furniture", type: "VENDOR", email: "azure@example.com", mobile: "9876543210", city: "Mumbai", status: "Active" },
  { id: "2", name: "Nirmesh Pathak", type: "CUSTOMER", email: "nirmesh@example.com", mobile: "9234567890", city: "Pune", status: "Active" },
  { id: "3", name: "Rahul Sharma", type: "BOTH", email: "rahul@example.com", mobile: "9987676665", city: "Delhi", status: "Active" },
];

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
  const [contacts, setContacts] = useState(mockContacts);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: "CUSTOMER" },
  });

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

  const onSubmit = (data: ContactForm) => {
    if (editingContact) {
      setContacts((prev) => prev.map((c) => c.id === editingContact.id ? { ...c, ...data } : c));
    } else {
      setContacts((prev) => [...prev, { id: String(Date.now()), ...data, status: "Active" } as any]);
    }
    setOpen(false);
  };

  const deleteContact = (id: string) => setContacts((prev) => prev.filter((c) => c.id !== id));

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search);
    const matchTab = tab === "all" || c.type === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <Button size="sm" onClick={openAdd} className="gap-1.5">
          <Plus size={15} /> New Contact
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["all", "CUSTOMER", "VENDOR"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
              tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "all" ? "All" : t === "CUSTOMER" ? "Customers" : "Vendors"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input
            placeholder="Search contacts..."
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter size={13} /> Filter
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
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
            {filtered.map((contact) => {
              const typeStyle = typeLabels[contact.type] || typeLabels.CUSTOMER;
              return (
                <TableRow key={contact.id} className="hover:bg-gray-50/50">
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
                  <TableCell className="text-xs text-muted-foreground">{contact.email}</TableCell>
                  <TableCell className="text-xs">{contact.mobile}</TableCell>
                  <TableCell className="text-xs">{contact.city}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${contact.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {contact.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(contact)}>
                        <Pencil size={13} className="text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteContact(contact.id)}>
                        <Trash2 size={13} className="text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10 text-sm">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">
          Showing 1 to {filtered.length} of {filtered.length} entries
        </div>
      </div>

      {/* Add/Edit Dialog */}
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
                <Select defaultValue="CUSTOMER" onValueChange={(v) => setValue("type", v as any)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
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
              <Button type="submit" size="sm">{editingContact ? "Update Contact" : "Save Contact"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
