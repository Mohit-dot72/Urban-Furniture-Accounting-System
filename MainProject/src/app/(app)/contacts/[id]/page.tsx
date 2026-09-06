"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Building2,
  DollarSign,
  ShoppingCart,
  Receipt,
  Pencil,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
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
  CUSTOMER: { label: "Customer", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800" },
  VENDOR: { label: "Vendor", className: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800" },
  BOTH: { label: "Customer & Vendor", className: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border border-teal-200 dark:border-teal-800" },
};

export default function ContactProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"invoices" | "orders" | "payments">("invoices");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const fetchContactDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (!res.ok) {
        setContact(null);
        return;
      }
      const data = await res.json();
      setContact(data);
      reset({
        name: data.name,
        type: data.type,
        email: data.email || "",
        mobile: data.mobile || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        address: data.address || "",
        gstNo: data.gstNo || "",
      });
    } catch (err) {
      console.error("Error fetching contact:", err);
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchContactDetails();
  }, [fetchContactDetails]);

  const onUpdateContact = async (data: ContactForm) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpenEdit(false);
        fetchContactDetails();
      }
    } catch (err) {
      console.error("Error updating contact:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground">Loading contact profile...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="space-y-4">
        <Link href="/contacts">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft size={14} /> Back to Contacts
          </Button>
        </Link>
        <div className="bg-card rounded-xl border p-12 text-center space-y-3">
          <AlertCircle className="mx-auto text-amber-500" size={40} />
          <h2 className="text-lg font-semibold">Contact Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The contact record you are trying to view does not exist or has been removed.
          </p>
          <Button size="sm" onClick={() => router.push("/contacts")}>
            Return to Contacts List
          </Button>
        </div>
      </div>
    );
  }

  // Accounting Summary Calculations
  const invoices = contact.invoices || [];
  const bills = contact.bills || [];
  const salesOrders = contact.salesOrders || [];
  const purchaseOrders = contact.purchaseOrders || [];
  const payments = contact.payments || [];

  const totalInvoiced = invoices.reduce((acc: number, inv: any) => acc + (inv.total || 0), 0);
  const totalBilled = bills.reduce((acc: number, b: any) => acc + (b.total || 0), 0);

  const totalReceived = payments
    .filter((p: any) => p.type === "Receive")
    .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

  const totalPaid = payments
    .filter((p: any) => p.type === "Send")
    .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

  // Outstanding Receivables (for Customer) / Payables (for Vendor)
  const outstandingReceivables = Math.max(0, totalInvoiced - totalReceived);

  const typeInfo = typeLabels[contact.type] || typeLabels.CUSTOMER;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/contacts">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
              {contact.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight">{contact.name}</h1>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${typeInfo.className}`}>
                  {typeInfo.label}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {contact.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                <span>Contact ID: <code className="text-foreground">{contact.id.slice(-8)}</code></span>
                <span>•</span>
                <span>Member since {new Date(contact.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={() => setOpenEdit(true)} className="gap-1.5 text-xs">
            <Pencil size={14} /> Edit Contact
          </Button>
        </div>
      </div>

      {/* Accounting KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invoices & Bills</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">
              ₹{(totalInvoiced + totalBilled).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
              <span>Customer: ₹{totalInvoiced.toLocaleString("en-IN")}</span>
              <span>•</span>
              <span>Vendor: ₹{totalBilled.toLocaleString("en-IN")}</span>
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Payments Logged</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{(totalReceived + totalPaid).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400"><ArrowDownLeft size={12} className="mr-0.5" /> ₹{totalReceived.toLocaleString("en-IN")} Received</span>
              <span>•</span>
              <span className="flex items-center text-purple-600 dark:text-purple-400"><ArrowUpRight size={12} className="mr-0.5" /> ₹{totalPaid.toLocaleString("en-IN")} Paid</span>
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Outstanding Balance</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{outstandingReceivables.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Uncollected balance from customer invoices
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">
              {salesOrders.length + purchaseOrders.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
              <span>{salesOrders.length} Sales Orders</span>
              <span>•</span>
              <span>{purchaseOrders.length} Purchase Orders</span>
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards (Personal & Financial Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal & Business Info */}
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Building2 size={16} className="text-primary" /> Personal & Business Details
            </h2>
            <span className="text-xs text-muted-foreground font-mono">GSTIN: {contact.gstNo || "Not Provided"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-muted/40 p-3 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Mail size={13} className="text-blue-500" /> Email Address
              </span>
              <p className="font-semibold text-sm text-foreground truncate">{contact.email || "—"}</p>
            </div>

            <div className="space-y-1 bg-muted/40 p-3 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-500" /> Mobile / Phone Number
              </span>
              <p className="font-semibold text-sm text-foreground">{contact.mobile || "—"}</p>
            </div>

            <div className="space-y-1 bg-muted/40 p-3 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <CreditCard size={13} className="text-purple-500" /> GST Identification No. (GSTIN)
              </span>
              <p className="font-semibold text-sm text-foreground font-mono">{contact.gstNo || "—"}</p>
            </div>

            <div className="space-y-1 bg-muted/40 p-3 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <MapPin size={13} className="text-rose-500" /> City & State
              </span>
              <p className="font-semibold text-sm text-foreground">
                {contact.city || "—"}{contact.state ? `, ${contact.state}` : ""} {contact.pincode ? `(${contact.pincode})` : ""}
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1 bg-muted/40 p-3 rounded-lg border border-border/50">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-500" /> Billing Address
              </span>
              <p className="font-semibold text-sm text-foreground">
                {contact.address || "No detailed address recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Profile Card */}
        <div className="bg-card rounded-xl border p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Financial Overview
              </h2>
              <span className="text-xs text-muted-foreground">Summary</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Contact Classification</span>
                <span className="font-semibold">{typeInfo.label}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Sales Invoices Count</span>
                <span className="font-semibold">{invoices.length}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Vendor Bills Count</span>
                <span className="font-semibold">{bills.length}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Total Sales Orders</span>
                <span className="font-semibold">{salesOrders.length}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Total Purchase Orders</span>
                <span className="font-semibold">{purchaseOrders.length}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Payment Records</span>
                <span className="font-semibold">{payments.length}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2 mt-4">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span>Account is fully reconciled with zero pending security flags.</span>
          </div>
        </div>
      </div>

      {/* Relational Activity Section (Tabs & Tables) */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight">Accounting Activity & Transactions</h2>
            <p className="text-xs text-muted-foreground">View all linked invoices, bills, orders, and payment receipts</p>
          </div>

          <div className="flex gap-1 bg-muted/60 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "invoices" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Invoices & Bills ({invoices.length + bills.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "orders" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Orders ({salesOrders.length + purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "payments" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Payments ({payments.length})
            </button>
          </div>
        </div>

        {/* TAB 1: Invoices & Bills */}
        {activeTab === "invoices" && (
          <div>
            {invoices.length === 0 && bills.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No invoices or bills found for this contact.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Document No</TableHead>
                      <TableHead className="text-xs font-semibold">Type</TableHead>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold">Due Date</TableHead>
                      <TableHead className="text-xs font-semibold">Items Count</TableHead>
                      <TableHead className="text-xs font-semibold">Total Amount</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv: any) => (
                      <TableRow key={inv.id} className="hover:bg-muted/40">
                        <TableCell className="font-semibold text-xs font-mono text-blue-600 dark:text-blue-400">
                          {inv.invoiceNo}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                            Customer Invoice
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(inv.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "—"}
                        </TableCell>
                        <TableCell className="text-xs">{inv.lines?.length || 0} items</TableCell>
                        <TableCell className="font-bold text-xs">₹{inv.total?.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            inv.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          }`}>
                            {inv.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}

                    {bills.map((bill: any) => (
                      <TableRow key={bill.id} className="hover:bg-muted/40">
                        <TableCell className="font-semibold text-xs font-mono text-purple-600 dark:text-purple-400">
                          {bill.billNo}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                            Vendor Bill
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(bill.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-IN") : "—"}
                        </TableCell>
                        <TableCell className="text-xs">{bill.lines?.length || 0} items</TableCell>
                        <TableCell className="font-bold text-xs">₹{bill.total?.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            bill.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Sales & Purchase Orders */}
        {activeTab === "orders" && (
          <div>
            {salesOrders.length === 0 && purchaseOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No orders found for this contact.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Order No</TableHead>
                      <TableHead className="text-xs font-semibold">Order Type</TableHead>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold">Line Items</TableHead>
                      <TableHead className="text-xs font-semibold">Total Amount</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesOrders.map((so: any) => (
                      <TableRow key={so.id} className="hover:bg-muted/40">
                        <TableCell className="font-semibold text-xs font-mono text-blue-600 dark:text-blue-400">
                          {so.orderNo}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                            Sales Order
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(so.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="text-xs">{so.lines?.length || 0} products</TableCell>
                        <TableCell className="font-bold text-xs">₹{so.total?.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            {so.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}

                    {purchaseOrders.map((po: any) => (
                      <TableRow key={po.id} className="hover:bg-muted/40">
                        <TableCell className="font-semibold text-xs font-mono text-purple-600 dark:text-purple-400">
                          {po.orderNo}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                            Purchase Order
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(po.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="text-xs">{po.lines?.length || 0} products</TableCell>
                        <TableCell className="font-bold text-xs">₹{po.total?.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            {po.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Payment History */}
        {activeTab === "payments" && (
          <div>
            {payments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No payment transactions logged for this contact.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">Payment No</TableHead>
                      <TableHead className="text-xs font-semibold">Type</TableHead>
                      <TableHead className="text-xs font-semibold">Payment Mode</TableHead>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                      <TableHead className="text-xs font-semibold">Reference</TableHead>
                      <TableHead className="text-xs font-semibold">Amount</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p: any) => (
                      <TableRow key={p.id} className="hover:bg-muted/40">
                        <TableCell className="font-semibold text-xs font-mono">{p.paymentNo}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.type === "Receive"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                          }`}>
                            {p.type === "Receive" ? "Receipt In" : "Payment Out"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{p.mode}</TableCell>
                        <TableCell className="text-xs">{new Date(p.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">{p.reference || "—"}</TableCell>
                        <TableCell className="font-bold text-xs">₹{p.amount?.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                            {p.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Contact Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onUpdateContact)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                <Input {...register("name")} placeholder="Contact name" className="h-9 text-sm" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
                <Select defaultValue={contact.type} onValueChange={(v) => setValue("type", v as any)}>
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
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenEdit(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <><Loader2 className="animate-spin mr-1" size={14} /> Updating...</> : "Update Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
