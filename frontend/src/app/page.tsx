"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, IndianRupee, Wallet, Eye } from "lucide-react";

/* ── mock data ─────────────────────────────────────────────── */
const cashFlow = [
  { d: "01 May", in: 92000,  out: 68000 },
  { d: "08 May", in: 138000, out: 94000 },
  { d: "15 May", in: 124000, out: 108000 },
  { d: "21 May", in: 167000, out: 87000 },
  { d: "28 May", in: 182000, out: 102000 },
];

const expenses = [
  { name: "Purchase Expense", value: 395750, pct: "40%", color: "#3b82f6" },
  { name: "Rent Expense",     value: 250000, pct: "25%", color: "#8b5cf6" },
  { name: "Salary Expense",   value: 132000, pct: "15%", color: "#06b6d4" },
  { name: "Other Expense",    value: 175000, pct: "20%", color: "#f59e0b" },
];

const txns = [
  { date: "28 May 2025", type: "Invoice",       ref: "INV/2025/076", party: "Nakash Pathak",  amount: 125000, status: "Paid"      },
  { date: "27 May 2025", type: "Bill",          ref: "BILL/2025/055",party: "Azure Furniture", amount: 75000,  status: "Open"      },
  { date: "26 May 2025", type: "Payment (Bank)",ref: "PY/2025/033",  party: "Nakash Pathak",  amount: 125000, status: "Paid"      },
  { date: "25 May 2025", type: "Purchase Order",ref: "PO/2025/033",  party: "Azure Furniture", amount: 50000,  status: "Confirmed" },
  { date: "24 May 2025", type: "Sales Order",   ref: "SO/2025/019",  party: "Azure Furniture", amount: 150000, status: "Confirmed" },
];

const banks = [
  { name: "HDFC Bank",  no: "AC No: 1324567890", balance: 175250, color: "from-blue-600 to-blue-700" },
  { name: "ICICI Bank", no: "AC No: 1234567890", balance: 230750, color: "from-indigo-600 to-indigo-700" },
];

/* ── helpers ────────────────────────────────────────────────── */
const fmt = (n: number) =>
  "₹ " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const statusCls: Record<string, string> = {
  Paid:      "badge-paid",
  Open:      "badge-open",
  Confirmed: "badge-confirmed",
  Draft:     "badge-draft",
};

/* ── stat card ──────────────────────────────────────────────── */
function StatCard({ title, value, change, up, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
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

/* ── page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
          📅 01 May 2025 – 31 May 2025
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Sales"       value="₹ 12,45,000" change="+15.4% vs Apr" up icon={TrendingUp}    color="bg-emerald-500" />
        <StatCard title="Total Purchases"   value="₹ 8,75,000"  change="+8.2% vs Apr"  up icon={ShoppingCart}  color="bg-blue-500"    />
        <StatCard title="Total Receivables" value="₹ 2,35,000"  change="-2.8% vs Apr" up={false} icon={IndianRupee} color="bg-orange-500"  />
        <StatCard title="Total Payables"    value="₹ 1,65,000"  change="-4.1% vs Apr" up={false} icon={Wallet}      color="bg-red-500"     />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Cash Flow */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Cash Flow Overview</p>
            <div className="flex gap-3">
              {[{ color: "bg-blue-500", label: "Inflow" }, { color: "bg-orange-400", label: "Outflow" }].map(l => (
                <span key={l.label} className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className={`w-2.5 h-0.5 ${l.color} rounded-full inline-block`} />{l.label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cashFlow} margin={{ top: 2, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="in"  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} name="Inflow"  />
              <Line type="monotone" dataKey="out" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} name="Outflow" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Expenses */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Top Expenses</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={expenses} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3}>
                {expenses.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {expenses.map(e => (
              <div key={e.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: e.color }} />
                  {e.name}
                </span>
                <span className="font-semibold text-slate-700">{e.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Recent Transactions</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-wide bg-slate-50/70">
                <th className="text-left px-4 py-2.5 font-medium">Date</th>
                <th className="text-left px-3 py-2.5 font-medium">Type</th>
                <th className="text-left px-3 py-2.5 font-medium">Reference</th>
                <th className="text-left px-3 py-2.5 font-medium">Party</th>
                <th className="text-right px-3 py-2.5 font-medium">Amount</th>
                <th className="text-center px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-[11px] text-slate-500">{t.date}</td>
                  <td className="px-3 py-2.5 text-[11px] font-medium text-slate-700">{t.type}</td>
                  <td className="px-3 py-2.5 text-[11px] text-blue-600 font-mono">{t.ref}</td>
                  <td className="px-3 py-2.5 text-[11px] text-slate-600">{t.party}</td>
                  <td className="px-3 py-2.5 text-[11px] font-semibold text-right text-slate-800">{fmt(t.amount)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls[t.status]}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bank Accounts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Bank Accounts</p>
          </div>
          <div className="p-3 space-y-3">
            {banks.map((b, i) => (
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
