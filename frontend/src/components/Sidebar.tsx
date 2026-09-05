import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  LayoutDashboard,
  ShoppingCart,
  FileSpreadsheet,
  TrendingUp,
  FileCheck2,
  Receipt,
  BookOpen,
  PieChart,
  Users,
  Package,
  Target,
  FileBarChart,
  WalletCards,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'purchase-orders'
  | 'vendor-bills'
  | 'sales-orders'
  | 'customer-invoices'
  | 'payments'
  | 'journal-entries'
  | 'chart-of-accounts'
  | 'contacts'
  | 'products'
  | 'budgets'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { activeRole, vendorBills, customerInvoices } = useAccounting();

  // Unpaid count badges
  const unpaidBillsCount = vendorBills.filter((b) => b.paymentStatus !== 'paid').length;
  const unpaidInvoicesCount = customerInvoices.filter((i) => i.paymentStatus !== 'paid').length;

  if (activeRole === 'contact') {
    return (
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
        <div>
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
            Customer Portal
          </div>
          <nav className="mt-2 space-y-1">
            <button
              onClick={() => onSelectTab('customer-invoices')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'customer-invoices'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4" />
                <span>My Invoices</span>
              </div>
              {unpaidInvoicesCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {unpaidInvoicesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'payments'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Payment Receipts</span>
            </button>

            <button
              onClick={() => onSelectTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Furniture Catalog</span>
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Customer Access</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            View pending invoices, download receipts, and pay online with instant journal reconciliation.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Core Dashboard */}
        <div>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Transactions Section */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Operations & Flow
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('sales-orders')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'sales-orders'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Orders</span>
            </button>

            <button
              onClick={() => onSelectTab('customer-invoices')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'customer-invoices'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4" />
                <span>Customer Invoices</span>
              </div>
              {unpaidInvoicesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  {unpaidInvoicesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('purchase-orders')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'purchase-orders'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Purchase Orders</span>
            </button>

            <button
              onClick={() => onSelectTab('vendor-bills')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'vendor-bills'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Vendor Bills</span>
              </div>
              {unpaidBillsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                  {unpaidBillsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'payments'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <WalletCards className="w-4 h-4" />
              <span>Payments Register</span>
            </button>
          </div>
        </div>

        {/* Accounting & General Ledger */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            General Ledger
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('journal-entries')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'journal-entries'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Double-Entry Journals</span>
            </button>

            <button
              onClick={() => onSelectTab('chart-of-accounts')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'chart-of-accounts'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Chart of Accounts</span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'reports'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileBarChart className="w-4 h-4" />
              <span>Financial Reports (P&L, BS)</span>
            </button>
          </div>
        </div>

        {/* Master Data & Cost Centers */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Master Data & Budgets
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('contacts')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'contacts'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Contacts (Customers/Vendors)</span>
            </button>

            <button
              onClick={() => onSelectTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'products'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products & Services</span>
            </button>

            <button
              onClick={() => onSelectTab('budgets')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                currentTab === 'budgets'
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Analytic Budgets</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Engine Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Double-Entry Active
          </span>
        </div>
      </div>
    </aside>
  );
};
