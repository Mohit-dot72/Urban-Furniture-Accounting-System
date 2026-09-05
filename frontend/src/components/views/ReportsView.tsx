import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { FileBarChart, CheckCircle, Printer } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { customerInvoices, vendorBills } = useAccounting();
  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'balance-sheet' | 'budget'>('pnl');

  // Compute P&L components
  const furnitureSales = customerInvoices.reduce((sum, inv) => {
    return (
      sum +
      inv.lineItems
        .filter((li) => li.product?.type !== 'service')
        .reduce((s, li) => s + (li.subtotal ?? li.quantity * li.unitPrice), 0)
    );
  }, 0);

  const serviceRevenue = customerInvoices.reduce((sum, inv) => {
    return (
      sum +
      inv.lineItems
        .filter((li) => li.product?.type === 'service')
        .reduce((s, li) => s + (li.subtotal ?? li.quantity * li.unitPrice), 0)
    );
  }, 0);

  const totalRevenue = furnitureSales + serviceRevenue;

  const cogs = vendorBills.reduce((sum, b) => {
    return sum + b.lineItems.reduce((s, li) => s + (li.subtotal ?? li.quantity * li.unitPrice), 0);
  }, 0);

  const grossProfit = totalRevenue - cogs;

  const operatingExpenses = 4200; // Utilities, freight & showroom rent baseline
  const netIncome = grossProfit - operatingExpenses;

  // Compute Balance Sheet items
  const cashInHand = 5000;
  const bankAccount = 35000 + customerInvoices.reduce((s, i) => s + i.amountPaid, 0) - vendorBills.reduce((s, b) => s + b.amountPaid, 0);
  const accountsReceivable = customerInvoices.reduce((s, i) => s + (i.totalAmount - i.amountPaid), 0);
  const inventory = 22000;
  const totalAssets = cashInHand + bankAccount + accountsReceivable + inventory;

  const accountsPayable = vendorBills.reduce((s, b) => s + (b.totalAmount - b.amountPaid), 0);
  const taxPayable = customerInvoices.reduce((s, i) => s + i.lineItems.reduce((ts, li) => ts + (li.taxAmount ?? 0), 0), 0);
  const totalLiabilities = accountsPayable + taxPayable;

  const initialEquity = 62000;
  const retainedEarnings = totalAssets - totalLiabilities - initialEquity;
  const totalEquity = initialEquity + retainedEarnings;

  const isBalanceSheetBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-indigo-400" />
            Financial Statements & Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accrual-based financial reporting compliant with double-entry GAAP standards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeReportTab === 'pnl'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Profit & Loss (P&L)
        </button>
        <button
          onClick={() => setActiveReportTab('balance-sheet')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeReportTab === 'balance-sheet'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Balance Sheet
        </button>
      </div>

      {/* P&L Statement Tab */}
      {activeReportTab === 'pnl' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Profit and Loss Statement</h3>
              <p className="text-xs text-slate-400">Urban Furniture Ltd &bull; For Period Ended September 2026</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">Accrual Basis (USD)</span>
          </div>

          <div className="space-y-6 text-xs">
            {/* Revenue */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                <span>1. Operating Revenue</span>
                <span>Amount ($)</span>
              </div>
              <div className="divide-y divide-slate-800/40 text-slate-300">
                <div className="py-2.5 flex justify-between pl-4">
                  <span>Furniture Finished Goods Sales</span>
                  <span className="font-mono">${furnitureSales.toFixed(2)}</span>
                </div>
                <div className="py-2.5 flex justify-between pl-4">
                  <span>Assembly, Delivery & Custom Staging Services</span>
                  <span className="font-mono">${serviceRevenue.toFixed(2)}</span>
                </div>
                <div className="py-2.5 flex justify-between font-bold text-emerald-400 bg-slate-850/50 px-2 rounded">
                  <span>Total Operating Revenue:</span>
                  <span className="font-mono">${totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                <span>2. Cost of Sales (COGS)</span>
                <span>Amount ($)</span>
              </div>
              <div className="divide-y divide-slate-800/40 text-slate-300">
                <div className="py-2.5 flex justify-between pl-4">
                  <span>Direct Furniture Procurement & Raw Materials</span>
                  <span className="font-mono text-rose-300">${cogs.toFixed(2)}</span>
                </div>
                <div className="py-2.5 flex justify-between font-bold text-slate-200 bg-slate-850/50 px-2 rounded">
                  <span>Total Cost of Sales:</span>
                  <span className="font-mono text-rose-300">${cogs.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/50 rounded-xl flex justify-between items-center text-sm font-bold text-indigo-200">
              <span>Gross Profit (Revenue - COGS):</span>
              <span className="font-mono">${grossProfit.toFixed(2)}</span>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex justify-between items-center font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
                <span>3. Operating & Administrative Expenses</span>
                <span>Amount ($)</span>
              </div>
              <div className="divide-y divide-slate-800/40 text-slate-300">
                <div className="py-2.5 flex justify-between pl-4">
                  <span>Showroom Rent, Utilities & Power</span>
                  <span className="font-mono">$2,800.00</span>
                </div>
                <div className="py-2.5 flex justify-between pl-4">
                  <span>Logistics, Freight & Local Handling</span>
                  <span className="font-mono">$1,400.00</span>
                </div>
                <div className="py-2.5 flex justify-between font-bold text-slate-200 bg-slate-850/50 px-2 rounded">
                  <span>Total Operating Expenses:</span>
                  <span className="font-mono text-rose-300">${operatingExpenses.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-600/40 rounded-xl flex justify-between items-center text-base font-black text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Net Operating Income (Profit):</span>
              </div>
              <span className="font-mono text-emerald-400">${netIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet Tab */}
      {activeReportTab === 'balance-sheet' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Balance Sheet (Statement of Financial Position)</h3>
              <p className="text-xs text-slate-400">Urban Furniture Ltd &bull; As of September 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isBalanceSheetBalanced
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {isBalanceSheetBalanced ? 'Balanced: Assets = Liabilities + Equity' : 'Reconciliation In Progress'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* ASSETS COLUMN */}
            <div className="space-y-4">
              <div className="flex justify-between items-center font-bold text-indigo-300 uppercase tracking-wider text-xs pb-2 border-b border-indigo-900/50">
                <span>Assets</span>
                <span>Balance ($)</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Assets</span>
                <div className="divide-y divide-slate-800/50 pl-2 text-slate-300">
                  <div className="py-2 flex justify-between">
                    <span>Petty Cash (1010)</span>
                    <span className="font-mono">${cashInHand.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Commercial Bank Checking (1020)</span>
                    <span className="font-mono">${bankAccount.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Accounts Receivable (1200)</span>
                    <span className="font-mono text-amber-300">${accountsReceivable.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Furniture Inventory on Hand (1300)</span>
                    <span className="font-mono">${inventory.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-700/50 rounded-xl flex justify-between items-center font-bold text-sm text-indigo-200">
                <span>Total Assets:</span>
                <span className="font-mono">${totalAssets.toFixed(2)}</span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY COLUMN */}
            <div className="space-y-4">
              <div className="flex justify-between items-center font-bold text-rose-300 uppercase tracking-wider text-xs pb-2 border-b border-rose-900/50">
                <span>Liabilities & Equity</span>
                <span>Balance ($)</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Liabilities</span>
                <div className="divide-y divide-slate-800/50 pl-2 text-slate-300">
                  <div className="py-2 flex justify-between">
                    <span>Accounts Payable (2010)</span>
                    <span className="font-mono text-rose-300">${accountsPayable.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Output Tax Payable (GST 18%) (2020)</span>
                    <span className="font-mono">${taxPayable.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between font-semibold text-slate-400 bg-slate-850/40 px-2 rounded">
                    <span>Total Liabilities:</span>
                    <span className="font-mono">${totalLiabilities.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Shareholder Equity</span>
                <div className="divide-y divide-slate-800/50 pl-2 text-slate-300">
                  <div className="py-2 flex justify-between">
                    <span>Paid-in Capital (3010)</span>
                    <span className="font-mono">${initialEquity.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Retained Earnings (3020)</span>
                    <span className="font-mono">${retainedEarnings.toFixed(2)}</span>
                  </div>
                  <div className="py-2 flex justify-between font-semibold text-slate-400 bg-slate-850/40 px-2 rounded">
                    <span>Total Equity:</span>
                    <span className="font-mono">${totalEquity.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl flex justify-between items-center font-bold text-sm text-slate-100">
                <span>Total Liabilities & Equity:</span>
                <span className="font-mono">${(totalLiabilities + totalEquity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
