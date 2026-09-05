"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function SalesFlowPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sales Flow</h1>
        <Button size="sm" className="gap-1.5"><Plus size={15} /> New Sales Order</Button>
      </div>

      <div className="bg-card rounded-xl shadow-none border border-border p-8 flex flex-col md:flex-row items-center justify-center gap-4 overflow-x-auto">
        
        {/* Sales Order */}
        <Card className="w-72 shrink-0 border border-border shadow-none relative">
          <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-foreground">Sales Order</CardTitle>
            <p className="text-xs font-mono text-blue-600 mt-1">SO/2025/019</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2 text-sm space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">For</p>
              <p className="font-medium">Nirmesh Pathak</p>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">26 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">{fmt(125000)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
             <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">View / Edit</Button>
          </CardFooter>
        </Card>

        <ArrowRight className="text-slate-300 hidden md:block" size={32} />
        <div className="h-8 w-[2px] bg-slate-200 md:hidden block" />

        {/* Customer Invoice */}
        <Card className="w-72 shrink-0 border border-border shadow-none relative">
          <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-foreground">Customer Invoice</CardTitle>
            <p className="text-xs font-mono text-blue-600 mt-1">INV/2025/016</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2 text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">From SO</span>
              <span className="font-mono text-xs">SO/2025/019</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3">
              <span className="text-muted-foreground">Invoice Date</span>
              <span className="font-medium">28 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">07 Jun 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">{fmt(125000)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
             <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">View / Edit</Button>
          </CardFooter>
        </Card>

        <ArrowRight className="text-slate-300 hidden md:block" size={32} />
        <div className="h-8 w-[2px] bg-slate-200 md:hidden block" />

        {/* Receipt */}
        <Card className="w-72 shrink-0 border border-border shadow-none relative">
          <CardHeader className="pb-3 border-b border-border bg-muted/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-foreground">Receipt (Bank)</CardTitle>
            <p className="text-xs font-mono text-blue-600 mt-1">RCPT/2025/019</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2 text-sm space-y-3">
             <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium">Nirmesh Pathak</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">28 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="font-medium">HDFC Bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">{fmt(125000)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Received</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
             <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">View / Edit</Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
