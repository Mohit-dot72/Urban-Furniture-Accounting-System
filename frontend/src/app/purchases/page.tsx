"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function PurchaseFlowPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Purchase Flow</h1>
        <Button size="sm" className="gap-1.5"><Plus size={15} /> New Purchase Order</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-center gap-4 overflow-x-auto">
        
        {/* Purchase Order */}
        <Card className="w-72 shrink-0 border border-slate-200 shadow-sm relative">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-slate-800">Purchase Order</CardTitle>
            <p className="text-xs font-mono text-blue-600 mt-1">PO/2025/011</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2 text-sm space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Vendor</p>
              <p className="font-medium">Azure Furniture</p>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">24 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold text-slate-800">{fmt(110000)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Status</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
             <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">View / Edit</Button>
          </CardFooter>
        </Card>

        <ArrowRight className="text-slate-300 hidden md:block" size={32} />
        <div className="h-8 w-[2px] bg-slate-200 md:hidden block" />

        {/* Vendor Bill */}
        <Card className="w-72 shrink-0 border border-slate-200 shadow-sm relative">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-slate-800">Vendor Bill</CardTitle>
            <p className="text-xs font-mono text-blue-600 mt-1">BILL/2025/032</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2 text-sm space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">From PO</span>
              <span className="font-mono text-xs">PO/2025/011</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3">
              <span className="text-slate-500">Bill Date</span>
              <span className="font-medium">27 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due Date</span>
              <span className="font-medium">10 Jun 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold text-slate-800">{fmt(110000)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Status</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">Open</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
             <Button variant="outline" className="w-full text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">View / Edit</Button>
          </CardFooter>
        </Card>

        <ArrowRight className="text-slate-300 hidden md:block" size={32} />
        <div className="h-8 w-[2px] bg-slate-200 md:hidden block" />

        {/* Payment */}
        <Card className="w-72 shrink-0 border border-slate-200 shadow-sm relative">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-slate-800">Payment (Bank)</CardTitle>
            <p className="text-xs font-mono text-blue-600 mt-1">PYMNT/2025/001</p>
          </CardHeader>
          <CardContent className="pt-4 pb-2 text-sm space-y-3">
             <div className="flex justify-between">
              <span className="text-slate-500">To</span>
              <span className="font-medium">Azure Furniture</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-3">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">27 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mode</span>
              <span className="font-medium">HDFC Bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-800">{fmt(110000)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">Status</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>
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
