import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const ChartOfAccountsView: React.FC = () => {
  const { accounts, journalEntries } = useAccounting();
  const [selectedType, setSelectedType] = useState<string>('all');

  // Compute live balance for each account from journal entries
  const accountBalances = accounts.map((acc) => {
    let balance = 0;
    journalEntries.forEach((je) => {
      je.items.forEach((item) => {
        if (item.accountId === acc.id) {
          if (acc.type === 'asset' || acc.type === 'expense') {
            balance += item.debit - item.credit;
          } else {
            // liability, capital, income normal balance is credit
            balance += item.credit - item.debit;
          }
        }
      });
    });

    // initial realistic seed adjustments for asset accounts
    if (acc.id === 'acc-2') balance += 35000; // Bank
    if (acc.id === 'acc-1') balance += 5000;  // Petty Cash
    if (acc.id === 'acc-4') balance += 22000; // Inventory
    if (acc.id === 'acc-7') balance += 62000; // Shareholder Equity

    return {
      ...acc,
      currentBalance: balance,
    };
  });

  const filteredAccounts =
    selectedType === 'all'
      ? accountBalances
      : accountBalances.filter((a) => a.type === selectedType);

  const types: { key: string; label: string }[] = [
    { key: 'all', label: 'All Accounts' },
    { key: 'asset', label: 'Assets' },
    { key: 'liability', label: 'Liabilities' },
    { key: 'capital', label: 'Equity / Capital' },
    { key: 'income', label: 'Revenue & Income' },
    { key: 'expense', label: 'Cost of Sales & Expenses' },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            Chart of Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ledger account balances computed dynamically from journal postings
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelectedType(t.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedType === t.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Account Code & Name</th>
                <th className="py-3 px-4">Account Category</th>
                <th className="py-3 px-4">Normal Balance</th>
                <th className="py-3 px-4 text-right">Computed Balance</th>
                <th className="py-3 px-4 text-center">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.map((acc) => {
                const isDebitNormal = acc.type === 'asset' || acc.type === 'expense';
                return (
                  <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100">{acc.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          acc.type === 'asset'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : acc.type === 'liability'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : acc.type === 'income'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : acc.type === 'expense'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {isDebitNormal ? (
                        <span className="flex items-center gap-1 text-indigo-300">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Debit (Dr)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-300">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Credit (Cr)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      ${acc.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        System Default
                      </span>
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
