import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, Filter } from 'lucide-react';

export const JournalEntriesView: React.FC = () => {
  const { journalEntries, journals } = useAccounting();

  const [selectedJournalId, setSelectedJournalId] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'je-601': true,
    'je-603': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEntries =
    selectedJournalId === 'all'
      ? journalEntries
      : journalEntries.filter((je) => je.journalId === selectedJournalId);

  // Overall ledger totals
  const overallDebit = filteredEntries.reduce(
    (sum, je) => sum + je.items.reduce((s, i) => s + i.debit, 0),
    0
  );
  const overallCredit = filteredEntries.reduce(
    (sum, je) => sum + je.items.reduce((s, i) => s + i.credit, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Double-Entry Journal Entries (General Ledger)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every transaction maintains mathematical parity: Total Debits = Total Credits
          </p>
        </div>

        {/* Parity Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Parity</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              ${overallDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })} Dr / $
              {overallCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })} Cr
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Strictly Balanced
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-400">Filter by Journal:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedJournalId('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              selectedJournalId === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Journals ({journalEntries.length})
          </button>
          {journals.map((j) => {
            const count = journalEntries.filter((je) => je.journalId === j.id).length;
            return (
              <button
                key={j.id}
                onClick={() => setSelectedJournalId(j.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedJournalId === j.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {j.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/80 rounded-2xl border border-slate-800">
            No journal entries match the selected criteria.
          </div>
        ) : (
          filteredEntries.map((je) => {
            const isExpanded = !!expandedIds[je.id];
            const totalDr = je.items.reduce((s, i) => s + i.debit, 0);
            const totalCr = je.items.reduce((s, i) => s + i.credit, 0);

            // Check rule tag
            const isRuleA = je.reference?.includes('Rule A');
            const isRuleB = je.reference?.includes('Rule B');
            const isRuleC = je.reference?.includes('Rule C');
            const isRuleD = je.reference?.includes('Rule D');

            return (
              <div
                key={je.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                {/* Entry Header Card */}
                <div
                  onClick={() => toggleExpand(je.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-200 p-0.5">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{je.reference}</span>
                        {isRuleA && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Rule A: Bill Settlement
                          </span>
                        )}
                        {isRuleB && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Rule B: Vendor Bill
                          </span>
                        )}
                        {isRuleC && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Rule C: Customer Invoice
                          </span>
                        )}
                        {isRuleD && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Rule D: Customer Receipt
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>Date: {je.date}</span>
                        <span>&bull;</span>
                        <span>Journal: {je.journal.name}</span>
                        <span>&bull;</span>
                        <span className="capitalize">Source: {je.sourceType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        Amount
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        ${totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Balanced
                    </span>
                  </div>
                </div>

                {/* Line Items Table when expanded */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/50 p-4">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="uppercase text-[10px] font-semibold text-slate-500 border-b border-slate-800 pb-2">
                        <tr>
                          <th className="py-2 px-3">Account Code & Name</th>
                          <th className="py-2 px-3">Analytic Center</th>
                          <th className="py-2 px-3 text-right">Debit ($)</th>
                          <th className="py-2 px-3 text-right">Credit ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {je.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-900/60">
                            <td className="py-2.5 px-3 font-medium text-slate-200">
                              {item.account.name}
                              <span className="ml-2 text-[10px] text-slate-500 uppercase">
                                [{item.account.type}]
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {item.analyticAccount ? (
                                <span className="px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 text-[11px]">
                                  {item.analyticAccount.name}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-indigo-300">
                              {item.debit > 0
                                ? `$${item.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-300">
                              {item.credit > 0
                                ? `$${item.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t border-slate-800 font-bold text-slate-200">
                        <tr>
                          <td colSpan={2} className="py-2.5 px-3 text-right text-slate-400">
                            Totals (Balanced):
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-indigo-400">
                            ${totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                            ${totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
