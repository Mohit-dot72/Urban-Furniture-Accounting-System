"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, IndianRupee, Wallet, Loader2 } from "lucide-react";

/* ── helpers ────────────────────────────────────────────────── */
const fmt = (n: number) =>
  "₹ " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

const statusCls: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[10px]",
  Received: "bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[10px]",
  Sent: "bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-[10px]",
  Open: "bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full text-[10px]",
  Confirmed: "bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-[10px]",
  Draft: "bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-full text-[10px]",
};

/* ── stat card ──────────────────────────────────────────────── */
function StatCard({ title, value, change, up, icon: Icon, color }: any) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-none border border-border flex items-start justify-between">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{change}
        </p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading real-time financial stats...
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const cashFlow = data?.cashFlow || [];
  const expenses = data?.expenses || [];
  const txns = data?.recentTxns || [];
  const banks = data?.bankAccounts || [];

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">Live Financial Summary & Ledger Metrics</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5 shadow-none font-medium">
          📅 Active Period: May 2025 – Present
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Sales" value={fmt(kpis.totalSales)} change="+15.4% live" up icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Total Purchases" value={fmt(kpis.totalPurchases)} change="+8.2% live" up icon={ShoppingCart} color="bg-blue-500" />
        <StatCard title="Total Receivables" value={fmt(kpis.totalReceivables)} change="Open Invoices" up={false} icon={IndianRupee} color="bg-orange-500" />
        <StatCard title="Total Payables" value={fmt(kpis.totalPayables)} change="Unpaid Bills" up={false} icon={Wallet} color="bg-red-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Cash Flow */}
        <div className="lg:col-span-4 bg-card rounded-xl shadow-none border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Cash Flow Overview (Receipts & Disbursements)</p>
            <div className="flex gap-3">
              {[{ color: "bg-blue-500", label: "Inflow" }, { color: "bg-orange-400", label: "Outflow" }].map(l => (
                <span key={l.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className={`w-2.5 h-0.5 ${l.color} rounded-full inline-block`} />{l.label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cashFlow} margin={{ top: 2, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} name="Inflow" />
              <Line type="monotone" dataKey="out" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="Outflow" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Expenses */}
        <div className="lg:col-span-3 bg-card rounded-xl shadow-none border border-border p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Top Expenses Breakdown</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={expenses} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3}>
                {expenses.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {expenses.map((e: any) => (
              <div key={e.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[170px]">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: e.color }} />
                  {e.name}
                </span>
                <span className="font-semibold text-foreground">{e.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-5 bg-card rounded-xl shadow-none border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent Transactions</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wide bg-muted/70">
                <th className="text-left px-4 py-2.5 font-medium">Date</th>
                <th className="text-left px-3 py-2.5 font-medium">Type</th>
                <th className="text-left px-3 py-2.5 font-medium">Reference</th>
                <th className="text-left px-3 py-2.5 font-medium">Party</th>
                <th className="text-right px-3 py-2.5 font-medium">Amount</th>
                <th className="text-center px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                txns.map((t: any, i: number) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{t.date}</td>
                    <td className="px-3 py-2.5 text-[11px] font-medium text-foreground">{t.type}</td>
                    <td className="px-3 py-2.5 text-[11px] text-blue-600 font-mono font-medium">{t.ref}</td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{t.party}</td>
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-right text-foreground">{fmt(t.amount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={statusCls[t.status] || "bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px]"}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bank Accounts */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-none border border-border">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Bank Accounts & Ledgers</p>
          </div>
          <div className="p-3 space-y-3">
            {banks.map((b: any, i: number) => (
              <div key={i} className={`bg-gradient-to-br ${b.color} rounded-xl p-3.5 text-white`}>
                <p className="text-[10px] text-blue-200 mb-0.5">{b.name}</p>
                <p className="text-[10px] font-mono text-blue-300 mb-2">{b.no}</p>
                <p className="text-base font-bold">{fmt(b.balance)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
