"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { ArrowRight, Plus, RefreshCw, Loader2, Search, Filter, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const salesSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.string().min(1, "Date is required"),
  total: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  status: z.enum(["Confirmed", "Draft"]),
  description: z.string().optional(),
});

type SalesForm = z.infer<typeof salesSchema>;

interface SalesOrderItem {
  id: string;
  orderNo: string;
  customerName: string;
  date: string;
  status: string;
  total: number;
  invoice: {
    invoiceNo: string;
    date: string;
    dueDate: string | null;
    status: string;
    total: number;
  } | null;
  receipt: {
    paymentNo: string;
    date: string;
    mode: string;
    amount: number;
    status: string;
  } | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function SalesFlowPage() {
  const [open, setOpen] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/sales/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setSalesOrders((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete sales order", err);
    }
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SalesForm>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      status: "Confirmed",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error("Failed to fetch sales orders");
      const data = await res.json();
      setSalesOrders(data);
    } catch (err) {
      console.error("Fetch sales orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const onSubmit = async (data: SalesForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create sales order");
      }

      const newOrder = await res.json();
      setSalesOrders((prev) => [newOrder, ...prev]);
      setOpen(false);
      reset();
    } catch (err: any) {
      alert(err.message || "Failed to create sales order.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = salesOrders.filter((s) =>
    s.customerName.toLowerCase().includes(search.toLowerCase()) ||
    s.orderNo.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSO = filtered[0] || salesOrders[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sales Flow</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live Sales Orders, Invoices & Customer Receipts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSalesOrders} className="h-8 text-xs gap-1">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 h-8 text-xs">
            <Plus size={15} /> New Sales Order
          </Button>
        </div>
      </div>

      {/* Visual Pipeline Flow for Selected Sales Order */}
      {selectedSO && (
        <div className="bg-card rounded-xl shadow-none border border-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-4 overflow-x-auto">
          {/* Sales Order Card */}
          <Card className="w-72 shrink-0 border border-border shadow-none relative">
            <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-foreground">Sales Order</CardTitle>
              <p className="text-xs font-mono text-blue-600 mt-1">{selectedSO.orderNo}</p>
            </CardHeader>
            <CardContent className="pt-4 pb-2 text-sm space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Customer</p>
                <p className="font-medium">{selectedSO.customerName}</p>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedSO.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{fmt(selectedSO.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedSO.status}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                View / Edit
              </Button>
            </CardFooter>
          </Card>

          <ArrowRight className="text-slate-300 hidden md:block" size={32} />
          <div className="h-8 w-[2px] bg-slate-200 md:hidden block" />

          {/* Customer Invoice Card */}
          <Card className="w-72 shrink-0 border border-border shadow-none relative">
            <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-foreground">Customer Invoice</CardTitle>
              <p className="text-xs font-mono text-blue-600 mt-1">
                {selectedSO.invoice ? selectedSO.invoice.invoiceNo : "INV/Pending"}
              </p>
            </CardHeader>
            <CardContent className="pt-4 pb-2 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From SO</span>
                <span className="font-mono text-xs">{selectedSO.orderNo}</span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3">
                <span className="text-muted-foreground">Invoice Date</span>
                <span className="font-medium">{selectedSO.invoice ? selectedSO.invoice.date : selectedSO.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{selectedSO.invoice?.dueDate || "14 Days"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{fmt(selectedSO.invoice?.total || selectedSO.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedSO.invoice?.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}>
                  {selectedSO.invoice?.status || "Open"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                View / Edit
              </Button>
            </CardFooter>
          </Card>

          <ArrowRight className="text-slate-300 hidden md:block" size={32} />
          <div className="h-8 w-[2px] bg-slate-200 md:hidden block" />

          {/* Receipt Card */}
          <Card className="w-72 shrink-0 border border-border shadow-none relative">
            <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-foreground">Receipt (Bank)</CardTitle>
              <p className="text-xs font-mono text-blue-600 mt-1">
                {selectedSO.receipt ? selectedSO.receipt.paymentNo : "RCPT/Pending"}
              </p>
            </CardHeader>
            <CardContent className="pt-4 pb-2 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span className="font-medium">{selectedSO.customerName}</span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedSO.receipt ? selectedSO.receipt.date : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">{selectedSO.receipt ? selectedSO.receipt.mode : "Bank / UPI"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">{fmt(selectedSO.receipt?.amount || selectedSO.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${selectedSO.receipt?.status === "Received" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground"
                  }`}>
                  {selectedSO.receipt?.status || "Pending"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                View / Edit
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Search & List Table of All Sales Orders */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Search sales orders by customer or SO no..."
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
            <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              Loading sales orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No sales orders found. Click &quot;New Sales Order&quot; to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80 hover:bg-muted/80">
                  <TableHead className="text-xs font-semibold text-muted-foreground">SO Number</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Customer Name</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Order Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Linked Invoice</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Amount (₹)</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((so) => (
                  <TableRow key={so.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-blue-600 font-medium py-3">{so.orderNo}</TableCell>
                    <TableCell className="text-sm font-medium">{so.customerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{so.date}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {so.invoice ? so.invoice.invoiceNo : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-right font-semibold">{fmt(so.total)}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {so.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDeleteTarget(so)}
                        title="Delete Sales Order"
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
              Are you sure you want to permanently delete sales order <strong className="text-foreground">{deleteTarget?.orderNo}</strong> ({deleteTarget?.customerName})?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
              ⚠️ Warning: This sales order will be permanently deleted and cannot be recovered.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW SALES ORDER MODAL DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Sales Order</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Name *</label>
                <Input
                  {...register("customerName")}
                  placeholder="e.g. Nakash Pathak or Priya Sharma"
                  className="h-9 text-sm"
                />
                {errors.customerName && (
                  <p className="text-[10px] text-red-500 mt-0.5">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Order Date *</label>
                <Input type="date" {...register("date")} className="h-9 text-sm" />
                {errors.date && (
                  <p className="text-[10px] text-red-500 mt-0.5">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status *</label>
                <Select defaultValue="Confirmed" onValueChange={(v) => setValue("status", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Total Amount (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("total")}
                  placeholder="e.g. 125000"
                  className="h-9 text-sm"
                />
                {errors.total && (
                  <p className="text-[10px] text-red-500 mt-0.5">{errors.total.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Item / Order Description</label>
                <Input
                  {...register("description")}
                  placeholder="e.g. Executive Teak Desk & Chairs"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5">
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving to DB...
                  </>
                ) : (
                  "Save Sales Order"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
