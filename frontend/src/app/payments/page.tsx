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
import { Plus, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const paymentSchema = z.object({
  type: z.enum(["RECEIVE", "SEND"]),
  contact: z.string().min(1),
  date: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  mode: z.enum(["Cash", "Bank", "UPI"]),
  reference: z.string().optional(),
});
type PaymentForm = z.infer<typeof paymentSchema>;

const mockPayments = [
  { id: "1", paymentNo: "PAY/2025/001", type: "RECEIVE", contact: "Nirmesh Pathak", date: "28 May 2025", amount: 125000, mode: "Bank", status: "Received" },
  { id: "2", paymentNo: "PAY/2025/002", type: "SEND", contact: "Azure Furniture", date: "27 May 2025", amount: 75000, mode: "HDFC Bank", status: "Sent" },
  { id: "3", paymentNo: "PAY/2025/003", type: "RECEIVE", contact: "Rahul Sharma", date: "26 May 2025", amount: 50000, mode: "Cash", status: "Received" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const statusStyle: Record<string, string> = {
  Received: "bg-emerald-100 text-emerald-700",
  Sent: "bg-blue-100 text-blue-700",
  Pending: "bg-orange-100 text-orange-700",
};

export default function PaymentsPage() {
  const [tab, setTab] = useState<"all" | "RECEIVE" | "SEND">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState(mockPayments);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { type: "RECEIVE", mode: "Bank", date: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = (data: PaymentForm) => {
    setPayments((prev) => [{
      id: String(Date.now()),
      paymentNo: `PAY/2025/${String(prev.length + 4).padStart(3, "0")}`,
      type: data.type,
      contact: data.contact,
      date: data.date,
      amount: data.amount,
      mode: data.mode,
      status: data.type === "RECEIVE" ? "Received" : "Sent",
    } as any, ...prev]);
    setOpen(false);
    reset();
  };

  const filtered = payments.filter((p) => {
    const matchSearch = p.contact.toLowerCase().includes(search.toLowerCase()) || p.paymentNo.includes(search);
    const matchTab = tab === "all" || p.type === tab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payments</h1>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5"><Plus size={15} /> New Payment</Button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["all", "RECEIVE", "SEND"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
            {t === "all" ? "All" : t === "RECEIVE" ? "Receive" : "Send"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
          <Input placeholder="Search payments..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Filter size={13} /> Filter</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="text-xs font-semibold text-muted-foreground">Payment No</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Party</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Mode</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Amount (₹)</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/50">
                <TableCell className="font-mono text-xs text-blue-600 font-medium py-3">{p.paymentNo}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.type === "RECEIVE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                    {p.type === "RECEIVE" ? "Receive" : "Send"}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                <TableCell className="text-sm font-medium">{p.contact}</TableCell>
                <TableCell className="text-xs">{p.mode}</TableCell>
                <TableCell className="text-xs text-right font-semibold">{fmt(p.amount)}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[p.status] || "bg-gray-100"}`}>{p.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
                <Select defaultValue="RECEIVE" onValueChange={(v) => setValue("type", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVE">Receive</SelectItem>
                    <SelectItem value="SEND">Send</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
                <Input type="date" {...register("date")} className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact *</label>
                <Input {...register("contact")} placeholder="Select contact" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount *</label>
                <Input {...register("amount")} type="number" step="0.01" placeholder="0.00" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mode *</label>
                <Select defaultValue="Bank" onValueChange={(v) => setValue("mode", v as any)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference</label>
                <Input {...register("reference")} placeholder="Reference No." className="h-9 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
