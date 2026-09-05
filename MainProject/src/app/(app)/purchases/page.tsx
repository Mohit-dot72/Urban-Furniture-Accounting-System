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

const purchaseSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required"),
  date: z.string().min(1, "Date is required"),
  total: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  status: z.enum(["Confirmed", "Draft"]),
  description: z.string().optional(),
});

type PurchaseForm = z.infer<typeof purchaseSchema>;

interface PurchaseOrderItem {
  id: string;
  orderNo: string;
  vendorName: string;
  date: string;
  status: string;
  total: number;
  bill: {
    billNo: string;
    date: string;
    dueDate: string | null;
    status: string;
    total: number;
  } | null;
  payment: {
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

export default function PurchaseFlowPage() {
  const [open, setOpen] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/purchases/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setPurchaseOrders((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete purchase order", err);
    }
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      status: "Confirmed",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchases");
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      const data = await res.json();
      setPurchaseOrders(data);
    } catch (err) {
      console.error("Fetch purchase orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const onSubmit = async (data: PurchaseForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create purchase order");
      }

      const newOrder = await res.json();
      setPurchaseOrders((prev) => [newOrder, ...prev]);
      setOpen(false);
      reset();
    } catch (err: any) {
      alert(err.message || "Failed to create purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = purchaseOrders.filter((p) =>
    p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    p.orderNo.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPO = filtered[0] || purchaseOrders[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Purchase Flow</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live Purchase Orders, Vendor Bills & Payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPurchaseOrders} className="h-8 text-xs gap-1">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 h-8 text-xs">
            <Plus size={15} /> New Purchase Order
          </Button>
        </div>
      </div>

      {/* Visual Pipeline Flow for Selected Purchase Order */}
      {selectedPO && (
        <div className="bg-card rounded-xl shadow-none border border-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-center gap-4 overflow-x-auto">
          {/* Purchase Order Card */}
          <Card className="w-72 shrink-0 border border-border shadow-none relative">
            <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-foreground">Purchase Order</CardTitle>
              <p className="text-xs font-mono text-blue-600 mt-1">{selectedPO.orderNo}</p>
            </CardHeader>
            <CardContent className="pt-4 pb-2 text-sm space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Vendor</p>
                <p className="font-medium">{selectedPO.vendorName}</p>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedPO.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{fmt(selectedPO.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedPO.status}
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

          {/* Vendor Bill Card */}
          <Card className="w-72 shrink-0 border border-border shadow-none relative">
            <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-foreground">Vendor Bill</CardTitle>
              <p className="text-xs font-mono text-blue-600 mt-1">
                {selectedPO.bill ? selectedPO.bill.billNo : "BILL/Pending"}
              </p>
            </CardHeader>
            <CardContent className="pt-4 pb-2 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From PO</span>
                <span className="font-mono text-xs">{selectedPO.orderNo}</span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3">
                <span className="text-muted-foreground">Bill Date</span>
                <span className="font-medium">{selectedPO.bill ? selectedPO.bill.date : selectedPO.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">{selectedPO.bill?.dueDate || "14 Days"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{fmt(selectedPO.bill?.total || selectedPO.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  selectedPO.bill?.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                }`}>
                  {selectedPO.bill?.status || "Open"}
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

          {/* Payment Card */}
          <Card className="w-72 shrink-0 border border-border shadow-none relative">
            <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
              <CardTitle className="text-sm font-semibold text-foreground">Payment (Bank)</CardTitle>
              <p className="text-xs font-mono text-blue-600 mt-1">
                {selectedPO.payment ? selectedPO.payment.paymentNo : "PY/Pending"}
              </p>
            </CardHeader>
            <CardContent className="pt-4 pb-2 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">{selectedPO.vendorName}</span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-3">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{selectedPO.payment ? selectedPO.payment.date : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-medium">{selectedPO.payment ? selectedPO.payment.mode : "HDFC Bank"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">{fmt(selectedPO.payment?.amount || selectedPO.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  selectedPO.payment?.status === "Sent" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground"
                }`}>
                  {selectedPO.payment?.status || "Pending"}
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

      {/* Search & List Table of All PostgreSQL Purchase Orders */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Search purchase orders by vendor or PO no..."
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
              Loading purchase orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No purchase orders found. Click &quot;New Purchase Order&quot; to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80 hover:bg-muted/80">
                  <TableHead className="text-xs font-semibold text-muted-foreground">PO Number</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Vendor Name</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Order Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Linked Vendor Bill</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Total Amount (₹)</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => (
                  <TableRow key={po.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-blue-600 font-medium py-3">{po.orderNo}</TableCell>
                    <TableCell className="text-sm font-medium">{po.vendorName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{po.date}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {po.bill ? po.bill.billNo : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-right font-semibold">{fmt(po.total)}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {po.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDeleteTarget(po)}
                        title="Delete Purchase Order"
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
              Are you sure you want to permanently delete purchase order <strong className="text-foreground">{deleteTarget?.orderNo}</strong> ({deleteTarget?.vendorName})?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200">
              ⚠️ Warning: This purchase order will be permanently deleted and cannot be recovered.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Permanently Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW PURCHASE ORDER MODAL DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Vendor Name *</label>
                <Input
                  {...register("vendorName")}
                  placeholder="e.g. Azure Furniture Ltd or Rajesh Timber Co."
                  className="h-9 text-sm"
                />
                {errors.vendorName && (
                  <p className="text-[10px] text-red-500 mt-0.5">{errors.vendorName.message}</p>
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
                  placeholder="e.g. 110000"
                  className="h-9 text-sm"
                />
                {errors.total && (
                  <p className="text-[10px] text-red-500 mt-0.5">{errors.total.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Item / Vendor Description</label>
                <Input
                  {...register("description")}
                  placeholder="e.g. Seasoned Oak Slabs / Bulk Workstations"
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
                  "Save Purchase Order"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
