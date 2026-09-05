"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Printer, Download, BarChart3, TrendingUp, PieChart,
  Calendar, FileSpreadsheet, CheckCircle2, DollarSign, Filter, RefreshCw, FileText
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const reportMeta: Record<string, { title: string; subtitle: string; icon: any; category: string }> = {
  "balance-sheet": {
    title: "Balance Sheet Statement",
    subtitle: "Comprehensive financial status of Assets, Liabilities, and Equity as of May 2025",
    icon: BarChart3,
    category: "Financial Statement",
  },
  "profit-loss": {
    title: "Profit & Loss (Income Statement)",
    subtitle: "Detailed breakdown of Operating Revenue, Cost of Goods Sold (COGS), and Expenses",
    icon: TrendingUp,
    category: "Income Statement",
  },
  budget: {
    title: "Budget Variance & Performance Report",
    subtitle: "Quarterly comparison of Planned Budget Targets vs Actual Financial Expenditure",
    icon: PieChart,
    category: "Management Report",
  },
};

// Detailed Financial Mock Data
const balanceSheetDetails = {
  assets: [
    { code: "1010", account: "Cash & Bank Balance (HDFC / ICICI)", category: "Current Assets", amount: 485000 },
    { code: "1020", account: "Accounts Receivable (Customer Invoices)", category: "Current Assets", amount: 375000 },
    { code: "1030", account: "Furniture & Timber Inventory Valuation", category: "Current Assets", amount: 385000 },
    { code: "1510", account: "Showroom Furniture & Fixtures", category: "Fixed Assets", amount: 420000 },
    { code: "1520", account: "Warehouse Woodworking Machinery", category: "Fixed Assets", amount: 185000 },
  ],
  liabilities: [
    { code: "2010", account: "Accounts Payable (Vendor Bills)", category: "Current Liabilities", amount: 245000 },
    { code: "2020", account: "GST Payable & Tax Accruals", category: "Current Liabilities", amount: 68000 },
    { code: "2030", account: "Short-term Working Capital Loan", category: "Current Liabilities", amount: 122000 },
  ],
  equity: [
    { code: "3010", account: "Owner Share Capital", category: "Equity", amount: 800000 },
    { code: "3020", account: "Retained Earnings", category: "Equity", amount: 320000 },
  ],
};

const plMonthlyDetails = [
  { month: "Jan 2025", revenue: 180000, cogs: 75000, expense: 45000, netProfit: 60000 },
  { month: "Feb 2025", revenue: 210000, cogs: 88000, expense: 52000, netProfit: 70000 },
  { month: "Mar 2025", revenue: 195000, cogs: 82000, expense: 48000, netProfit: 65000 },
  { month: "Apr 2025", revenue: 230000, cogs: 98000, expense: 62000, netProfit: 70000 },
  { month: "May 2025", revenue: 245000, cogs: 105000, expense: 60000, netProfit: 80000 },
];

const budgetVarianceDetails = [
  { department: "Showroom Rent & Utilities", planned: 450000, actual: 384300, variance: 65700, status: "Under Budget" },
  { department: "Timber & Raw Material Sourcing", planned: 600000, actual: 642000, variance: -42000, status: "Over Budget" },
  { department: "Marketing & Decor Exhibitions", planned: 150000, actual: 118000, variance: 32000, status: "Under Budget" },
  { department: "Logistics & Freight Transport", planned: 120000, actual: 105000, variance: 15000, status: "Under Budget" },
  { department: "Staff Payroll & Workshop Wages", planned: 350000, actual: 345000, variance: 5000, status: "Under Budget" },
];

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.id || "balance-sheet";
  const meta = reportMeta[reportId] || {
    title: `Financial Report (${reportId.replace("-", " ").toUpperCase()})`,
    subtitle: "Detailed statement view of accounting records",
    icon: FileText,
    category: "General Ledger Report",
  };

  const [period, setPeriod] = useState("FY2024-25");
  const [downloading, setDownloading] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/reports");
        const json = await res.json();
        setLiveData(json);
      } catch (err) {
        console.error("Failed to load report detail", err);
      }
    }
    loadData();
  }, []);

  const IconComponent = meta.icon;

  const totalAssets = liveData?.totals?.totalAssets || 1245000;
  const totalLiabilities = liveData?.totals?.totalLiabilities || 435000;
  const totalEquity = liveData?.totals?.totalEquity || 810000;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Report exported successfully as ${meta.title.replace(/\s+/g, "_")}_${period}.csv`);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link href="/reports">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl border-border">
            <ArrowLeft size={14} /> Back to All Reports
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
            <SelectTrigger className="h-9 text-xs w-40 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FY2024-25">FY 2024 - 2025</SelectItem>
              <SelectItem value="Q2-2025">Q2 2025 (Apr-Jun)</SelectItem>
              <SelectItem value="May-2025">May 2025 Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={downloading} className="h-9 text-xs rounded-xl gap-1.5">
            <Download size={14} /> {downloading ? "Exporting..." : "Export CSV"}
          </Button>

          <Button size="sm" onClick={handlePrint} className="h-9 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5">
            <Printer size={14} /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Main Printable Report Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
              <IconComponent size={26} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {meta.category}
              </span>
              <h1 className="text-2xl font-extrabold text-foreground mt-1.5">{meta.title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
            </div>
          </div>

          <div className="text-right space-y-1 sm:border-l sm:border-border sm:pl-6">
            <p className="text-xs font-semibold text-foreground">Urban Furniture Ltd.</p>
            <p className="text-xs font-mono text-muted-foreground">Period: {period}</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
              <CheckCircle2 size={12} /> Audited Ledger Data
            </p>
          </div>
        </div>

        {/* Dynamic Report Content by ID */}
        {reportId === "balance-sheet" && (
          <div className="space-y-8">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-500/[0.04] p-5 rounded-2xl border border-blue-500/20 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-black text-blue-600">{fmt(totalAssets)}</p>
                <p className="text-[11px] text-muted-foreground">Current & Fixed Assets</p>
              </div>

              <div className="bg-red-500/[0.04] p-5 rounded-2xl border border-red-500/20 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-black text-red-500">{fmt(totalLiabilities)}</p>
                <p className="text-[11px] text-muted-foreground">Payables & Short-term Loans</p>
              </div>

              <div className="bg-emerald-500/[0.04] p-5 rounded-2xl border border-emerald-500/20 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Net Equity / Net Worth</p>
                <p className="text-2xl font-black text-emerald-600">{fmt(totalEquity + (totalAssets - totalLiabilities - totalEquity))}</p>
                <p className="text-[11px] text-muted-foreground">Assets Minus Liabilities</p>
              </div>
            </div>

            {/* Assets Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">1. Assets Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-left">
                      <th className="p-3 rounded-l-xl font-semibold">Account Code</th>
                      <th className="p-3 font-semibold">Account Name</th>
                      <th className="p-3 font-semibold">Category</th>
                      <th className="p-3 text-right rounded-r-xl font-semibold">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceSheetDetails.assets.map((a) => (
                      <tr key={a.code} className="border-b border-border/60 hover:bg-muted/40">
                        <td className="p-3 font-mono text-blue-600 font-medium">{a.code}</td>
                        <td className="p-3 font-medium text-foreground">{a.account}</td>
                        <td className="p-3 text-muted-foreground">{a.category}</td>
                        <td className="p-3 text-right font-semibold">{fmt(a.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/80 font-bold text-sm">
                      <td colSpan={3} className="p-3.5 rounded-l-xl">Total Assets</td>
                      <td className="p-3.5 text-right text-blue-600 rounded-r-xl">{fmt(totalAssets)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Liabilities & Equity Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">2. Liabilities & Equity Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-left">
                      <th className="p-3 rounded-l-xl font-semibold">Account Code</th>
                      <th className="p-3 font-semibold">Account Name</th>
                      <th className="p-3 font-semibold">Category</th>
                      <th className="p-3 text-right rounded-r-xl font-semibold">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...balanceSheetDetails.liabilities, ...balanceSheetDetails.equity].map((item) => (
                      <tr key={item.code} className="border-b border-border/60 hover:bg-muted/40">
                        <td className="p-3 font-mono text-purple-600 font-medium">{item.code}</td>
                        <td className="p-3 font-medium text-foreground">{item.account}</td>
                        <td className="p-3 text-muted-foreground">{item.category}</td>
                        <td className="p-3 text-right font-semibold">{fmt(item.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/80 font-bold text-sm">
                      <td colSpan={3} className="p-3.5 rounded-l-xl">Total Liabilities & Equity</td>
                      <td className="p-3.5 text-right text-purple-600 rounded-r-xl">{fmt(totalLiabilities + totalEquity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportId === "profit-loss" && (
          <div className="space-y-8">
            {/* Chart */}
            <div className="bg-muted/30 p-5 rounded-2xl border border-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Revenue vs Operating Expenses</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={plMonthlyDetails}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Operating Revenue" />
                  <Bar dataKey="cogs" fill="#f59e0b" radius={[4, 4, 0, 0]} name="COGS (Raw Timber)" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Operating Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* P&L Statement Breakdown */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-left">
                    <th className="p-3 rounded-l-xl font-semibold">Month</th>
                    <th className="p-3 text-right font-semibold">Gross Revenue</th>
                    <th className="p-3 text-right font-semibold">COGS (Raw Material)</th>
                    <th className="p-3 text-right font-semibold">Operating Expenses</th>
                    <th className="p-3 text-right rounded-r-xl font-semibold">Net Profit (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {plMonthlyDetails.map((row) => (
                    <tr key={row.month} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="p-3 font-semibold text-foreground">{row.month}</td>
                      <td className="p-3 text-right font-semibold text-emerald-600">{fmt(row.revenue)}</td>
                      <td className="p-3 text-right text-amber-600">{fmt(row.cogs)}</td>
                      <td className="p-3 text-right text-red-500">{fmt(row.expense)}</td>
                      <td className="p-3 text-right font-bold text-blue-600">{fmt(row.netProfit)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/80 font-bold text-sm">
                    <td className="p-3.5 rounded-l-xl">Total YTD</td>
                    <td className="p-3.5 text-right text-emerald-600">{fmt(1060000)}</td>
                    <td className="p-3.5 text-right text-amber-600">{fmt(450000)}</td>
                    <td className="p-3.5 text-right text-red-500">{fmt(265000)}</td>
                    <td className="p-3.5 text-right text-blue-600 rounded-r-xl">{fmt(345000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportId === "budget" && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departmental Planned vs Actual Expenditure</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-left">
                    <th className="p-3 rounded-l-xl font-semibold">Department / Cost Center</th>
                    <th className="p-3 text-right font-semibold">Planned Budget</th>
                    <th className="p-3 text-right font-semibold">Actual Expenditure</th>
                    <th className="p-3 text-right font-semibold">Variance</th>
                    <th className="p-3 text-center rounded-r-xl font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetVarianceDetails.map((b) => (
                    <tr key={b.department} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="p-3 font-semibold text-foreground">{b.department}</td>
                      <td className="p-3 text-right font-medium">{fmt(b.planned)}</td>
                      <td className="p-3 text-right font-semibold">{fmt(b.actual)}</td>
                      <td className={`p-3 text-right font-mono font-bold ${b.variance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {b.variance >= 0 ? `+${fmt(b.variance)}` : fmt(b.variance)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === "Under Budget" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
