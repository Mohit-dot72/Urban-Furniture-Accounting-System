"use client";

import { useState, useEffect } from "react";
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
import { Plus, Search, Filter, RefreshCw, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const paymentSchema = z.object({
  type: z.enum(["RECEIVE", "SEND"]),
  contact: z.string().min(1, "Contact name is required"),
  date: z.string().min(1, "Date is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  mode: z.enum(["Cash", "Bank", "UPI", "Razorpay"]),
  reference: z.string().optional(),
});
type PaymentForm = z.infer<typeof paymentSchema>;

interface PaymentItem {
  id: string;
  paymentNo: string;
  type: "RECEIVE" | "SEND";
  contact: string;
  date: string;
  amount: number;
  mode: string;
  reference?: string;
  status: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const statusStyle: Record<string, string> = {
  Received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Sent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Pending: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export default function PaymentsPage() {
  const [tab, setTab] = useState<"all" | "RECEIVE" | "SEND">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // PostgreSQL Dynamic Payments State
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/payments/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete payment record", err);
    }
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { type: "RECEIVE", mode: "Bank", date: new Date().toISOString().split("T")[0] },
  });

  // Fetch payments from PostgreSQL Database API
  const fetchPayments = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/payments");
      if (!res.ok) {
        throw new Error("Failed to load payments from database.");
      }
      const data = await res.json();
      setPayments(data);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Post new payment to PostgreSQL Database API
  const onSubmit = async (data: PaymentForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create payment in database.");
      }

      const createdPayment = await res.json();
      setPayments((prev) => [createdPayment, ...prev]);
      setOpen(false);
      reset();
    } catch (err: any) {
      alert(err.message || "Failed to save payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.contact.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentNo.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));
    const matchTab = tab === "all" || p.type === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live Receipts & Vendor Payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPayments} className="h-8 gap-1 text-xs">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 h-8 text-xs">
            <Plus size={15} /> New Payment
          </Button>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {(["all", "RECEIVE", "SEND"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === t ? "bg-card shadow-none text-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "all" ? "All" : t === "RECEIVE" ? "Receive" : "Send"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input
            placeholder="Search payments by party, ref or PAY no..."
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Filter size={13} /> Filter
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-none overflow-hidden border border-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-blue-500" />
            Loading payments...
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center text-xs text-red-500 space-y-2">
            <p>{fetchError}</p>
            <Button size="sm" variant="outline" onClick={fetchPayments} className="h-7 text-xs">
              Retry Connection
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No payments found</p>
            <p className="text-xs text-muted-foreground">
              No matching payment records found. Click &quot;New Payment&quot; to add a payment.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/80 hover:bg-muted/80">
                <TableHead className="text-xs font-semibold text-muted-foreground">Payment No</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Party / Contact</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Mode</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right">Amount (₹)</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-blue-600 font-medium py-3">{p.paymentNo}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.type === "RECEIVE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {p.type === "RECEIVE" ? "Receive" : "Send"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="text-sm font-medium">{p.contact}</TableCell>
                  <TableCell className="text-xs">{p.mode}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{p.reference || "-"}</TableCell>
                  <TableCell className="text-xs text-right font-semibold">{fmt(p.amount)}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[p.status] || "bg-muted/50"}`}>
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteTarget(p)}
                      title="Delete Payment Record"
                    >
                      <Trash2 size={13} className="text-red-400 hover:text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
              Are you sure you want to permanently delete payment receipt <strong className="text-foreground">{deleteTarget?.paymentNo}</strong> ({deleteTarget?.contact})?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
              ⚠️ Warning: This payment record will be permanently deleted and cannot be recovered.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Payment Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>New Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
                <Select defaultValue="RECEIVE" onValueChange={(v) => setValue("type", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVE">Receive (Customer Receipt)</SelectItem>
                    <SelectItem value="SEND">Send (Vendor Payment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
                <Input type="date" {...register("date")} className="h-9 text-sm" />
                {errors.date && <p className="text-[10px] text-red-500 mt-0.5">{errors.date.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Party / Contact Name *</label>
                <Input {...register("contact")} placeholder="e.g. Nakash Pathak or Azure Furniture" className="h-9 text-sm" />
                {errors.contact && <p className="text-[10px] text-red-500 mt-0.5">{errors.contact.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount (₹) *</label>
                <Input {...register("amount")} type="number" step="0.01" placeholder="0.00" className="h-9 text-sm" />
                {errors.amount && <p className="text-[10px] text-red-500 mt-0.5">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mode *</label>
                <Select defaultValue="Bank" onValueChange={(v) => setValue("mode", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Razorpay">Razorpay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference / Cheque No.</label>
                <Input {...register("reference")} placeholder="e.g. TXN-882299" className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5">
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Payment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
