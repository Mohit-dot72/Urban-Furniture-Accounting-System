"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, PieChart, TrendingUp, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const balanceSheetData = [
  { name: "Assets", amount: 1245000 },
  { name: "Liabilities", amount: 435000 },
  { name: "Equity", amount: 810000 },
];

const plData = [
  { month: "Jan", revenue: 180000, expense: 120000 },
  { month: "Feb", revenue: 210000, expense: 140000 },
  { month: "Mar", revenue: 195000, expense: 130000 },
  { month: "Apr", revenue: 230000, expense: 160000 },
  { month: "May", revenue: 245000, expense: 165000 },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Reports</h1>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-none hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-blue-600" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Balance Sheet</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time snapshot of Assets, Liabilities and Capital</p>
            </div>
            <Button size="sm" variant="outline" className="mt-auto gap-1.5 text-xs">
              View Report <ArrowRight size={12} />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Profit & Loss Account</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Income from sales minus purchases/expenses equals net profit</p>
            </div>
            <Button size="sm" variant="outline" className="mt-auto gap-1.5 text-xs">
              View Report <ArrowRight size={12} />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
              <PieChart className="text-purple-600" size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Budget Report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Overview of planned budget vs actual expenses</p>
            </div>
            <Button size="sm" variant="outline" className="mt-auto gap-1.5 text-xs">
              View Report <ArrowRight size={12} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">Balance Sheet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={balanceSheetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold">Profit & Loss (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={plData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Key Financial Metrics — May 2025</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b text-xs text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-medium">Metric</th>
                <th className="text-right px-5 py-2.5 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Total Revenue", value: 1245000, color: "text-emerald-600" },
                { label: "Total Expenses", value: 875000, color: "text-red-500" },
                { label: "Gross Profit", value: 370000, color: "text-blue-600" },
                { label: "Total Assets", value: 1850000, color: "text-foreground" },
                { label: "Total Liabilities", value: 435000, color: "text-foreground" },
                { label: "Net Worth (Equity)", value: 1415000, color: "text-blue-600" },
              ].map((row) => (
                <tr key={row.label} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-2.5 text-sm">{row.label}</td>
                  <td className={`px-5 py-2.5 text-right font-semibold text-sm ${row.color}`}>{fmt(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
