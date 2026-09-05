import React from 'react';
import { useAccounting } from '../../context/AccountingContext';
import {
  TrendingUp,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Building2,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { customerInvoices, vendorBills, journalEntries, accounts } = useAccounting();

  // Financial Calculations
  const totalRevenue = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalExpenses = vendorBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const netIncome = totalRevenue - totalExpenses;

  const totalReceivables = customerInvoices
    .filter((i) => i.paymentStatus !== 'paid')
    .reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);

  const totalPayables = vendorBills
    .filter((b) => b.paymentStatus !== 'paid')
    .reduce((sum, b) => sum + (b.totalAmount - b.amountPaid), 0);

  // Bank + Cash liquid balance
  const bankAcc = accounts.find((a) => a.id === 'acc-2');
  const cashAcc = accounts.find((a) => a.id === 'acc-1');

  const bankDebits = journalEntries.reduce((sum, je) => {
    const item = je.items.find((i) => i.accountId === bankAcc?.id);
    return sum + (item ? item.debit - item.credit : 0);
  }, 35000); // base initial cash injection

  const cashDebits = journalEntries.reduce((sum, je) => {
    const item = je.items.find((i) => i.accountId === cashAcc?.id);
    return sum + (item ? item.debit - item.credit : 0);
  }, 5000);

  const liquidTotal = bankDebits + cashDebits;

  // Chart data: Monthly comparison
  const monthlyChartData = [
    { month: 'Jun', Revenue: 18400, Expenses: 12100, NetProfit: 6300 },
    { month: 'Jul', Revenue: 24800, Expenses: 15400, NetProfit: 9400 },
    { month: 'Aug', Revenue: 31200, Expenses: 19800, NetProfit: 11400 },
    { month: 'Sep (Current)', Revenue: Math.round(totalRevenue), Expenses: Math.round(totalExpenses), NetProfit: Math.round(netIncome) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-900/40">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Executive Financial Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Double-Entry Sync
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time accounting ledger overview for Urban Furniture manufacturing & retail operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('sales-orders')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Sales Order
          </button>
          <button
            onClick={() => onNavigate('purchase-orders')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* 6 High-Level Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Invoiced</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% this month</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">COGS & Bills</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">
            ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Supplier procurement</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-slate-900/80 border border-indigo-900/40 rounded-xl p-4 hover:border-indigo-700/60 transition-colors bg-gradient-to-b from-indigo-950/20 to-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-300">Net Profit</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-indigo-300 mt-2">
            ${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-indigo-400 mt-1">
            <span>Operating Margin {totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 100) : 0}%</span>
          </div>
        </div>

        {/* Liquid Cash & Bank */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cash & Bank</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-2">
            ${liquidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-400 mt-1">
            <span>Liquid liquidity</span>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Receivables</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-amber-300 mt-2">
            ${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Uncollected invoices</span>
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Payables</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-300 mt-2">
            ${totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
            <span>Due to vendors</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Chart & Double-Entry Rule Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-200">Revenue & Expense Trajectory</h3>
              <p className="text-xs text-slate-400">Financial performance across accounting periods</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              USD Currency
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Invoiced Revenue" />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Bills & Expenses" />
                <Bar dataKey="NetProfit" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Operating Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Double-Entry Rules Reference Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-slate-200">Automated Accounting Rules</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Every money movement automatically generates double-entry balanced journal entries:
            </p>

            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-semibold text-purple-300">
                  <span>Rule B: Vendor Bill</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 rounded">Purchase Journal</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dr. Expense/Inventory + Dr. Tax &rarr; Cr. Accounts Payable
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-semibold text-blue-300">
                  <span>Rule A: Bill Payment</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 rounded">Bank / Cash</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dr. Accounts Payable &rarr; Cr. Bank/Cash Account
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-semibold text-emerald-300">
                  <span>Rule C: Customer Invoice</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 rounded">Sales Journal</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dr. Accounts Receivable &rarr; Cr. Sales Revenue + Cr. Tax
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-300">
                  <span>Rule D: Invoice Payment</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 rounded">Bank / Cash</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Dr. Bank/Cash &rarr; Cr. Accounts Receivable
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('journal-entries')}
            className="w-full mt-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-colors"
          >
            Inspect General Ledger &rarr;
          </button>
        </div>
      </div>

      {/* Recent Journal Entries Ledger Live Ticker */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-200">Recent Double-Entry Journal Entries</h3>
            <p className="text-xs text-slate-400">All transaction postings are strictly balanced (Dr = Cr)</p>
          </div>
          <button
            onClick={() => onNavigate('journal-entries')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View Full Ledger ({journalEntries.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] font-semibold text-slate-400">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Date</th>
                <th className="py-2.5 px-3">Journal</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Accounts Affected</th>
                <th className="py-2.5 px-3 text-right">Debit ($)</th>
                <th className="py-2.5 px-3 text-right">Credit ($)</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {journalEntries.slice(0, 5).map((je) => {
                const totalDr = je.items.reduce((s, i) => s + i.debit, 0);
                const totalCr = je.items.reduce((s, i) => s + i.credit, 0);
                const isBalanced = Math.abs(totalDr - totalCr) < 0.01;

                return (
                  <tr key={je.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-400">{je.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {je.journal.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{je.reference}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {je.items.map((i) => i.account.name.split(' - ')[1] || i.account.name).join(' / ')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-300">
                      ${totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300">
                      ${totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isBalanced ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Balanced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          <ShieldAlert className="w-3 h-3" /> Unbalanced
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
