"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, PieChart, TrendingUp, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const json = await res.json();
        setReportData(json);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Reports Center</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time balance sheet statements, profit & loss income performance, and budget variance analytics
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Balance Sheet */}
        <Link href="/reports/balance-sheet" className="block group">
          <Card className="border border-border shadow-none group-hover:border-blue-500/50 group-hover:shadow-md transition-all rounded-2xl overflow-hidden h-full">
            <CardContent className="p-6 flex flex-col items-start gap-4 h-full">
              <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <BarChart3 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground group-hover:text-blue-500 transition-colors">Balance Sheet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time snapshot of Assets, Liabilities, Working Capital & Capital Equity.
                </p>
              </div>
              <Button size="sm" variant="outline" className="mt-auto gap-1.5 text-xs rounded-xl border-border group-hover:border-blue-500 group-hover:text-blue-500">
                View Report <ArrowRight size={13} />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Card 2: Profit & Loss */}
        <Link href="/reports/profit-loss" className="block group">
          <Card className="border border-border shadow-none group-hover:border-emerald-500/50 group-hover:shadow-md transition-all rounded-2xl overflow-hidden h-full">
            <CardContent className="p-6 flex flex-col items-start gap-4 h-full">
              <div className="w-12 h-12 bg-emerald-600/10 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <TrendingUp size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground group-hover:text-emerald-500 transition-colors">Profit & Loss Account</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Income from sales minus COGS timber purchases and operating expenses.
                </p>
              </div>
              <Button size="sm" variant="outline" className="mt-auto gap-1.5 text-xs rounded-xl border-border group-hover:border-emerald-500 group-hover:text-emerald-500">
                View Report <ArrowRight size={13} />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Budget Report */}
        <Link href="/reports/budget" className="block group">
          <Card className="border border-border shadow-none group-hover:border-purple-500/50 group-hover:shadow-md transition-all rounded-2xl overflow-hidden h-full">
            <CardContent className="p-6 flex flex-col items-start gap-4 h-full">
              <div className="w-12 h-12 bg-purple-600/10 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <PieChart size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground group-hover:text-purple-500 transition-colors">Budget Variance Report</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Overview of planned Q2 budget targets vs actual departmental spending.
                </p>
              </div>
              <Button size="sm" variant="outline" className="mt-auto gap-1.5 text-xs rounded-xl border-border group-hover:border-purple-500 group-hover:text-purple-500">
                View Report <ArrowRight size={13} />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Balance Sheet Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Balance Sheet Overview</CardTitle>
            <Link href="/reports/balance-sheet" className="text-xs font-semibold text-blue-500 hover:underline">
              Full Statement →
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reportData?.balanceSheetData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">Monthly Profit & Loss</CardTitle>
            <Link href="/reports/profit-loss" className="text-xs font-semibold text-emerald-500 hover:underline">
              Full Statement →
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={reportData?.plData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue" />
                <Bar dataKey="expense" fill="#f87171" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 pt-5 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold">Key Financial Metrics — Active Period</CardTitle>
          <span className="text-xs font-mono text-muted-foreground">PostgreSQL Audited</span>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-border text-xs text-muted-foreground bg-muted/30">
                <th className="text-left px-6 py-3 font-semibold">Financial Metric</th>
                <th className="text-right px-6 py-3 font-semibold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(reportData?.keyMetrics || []).map((row: any) => (
                <tr key={row.label} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-3 text-xs font-medium text-foreground">{row.label}</td>
                  <td className={`px-6 py-3 text-right text-xs ${row.color}`}>{fmt(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
