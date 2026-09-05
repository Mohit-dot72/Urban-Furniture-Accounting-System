import React from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { WalletCards, ArrowDownLeft, ArrowUpRight, Building2, Banknote } from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments, activeRole, activeCustomerContactId, customerInvoices } = useAccounting();

  // Scoping for customer role
  const displayedPayments =
    activeRole === 'contact' && activeCustomerContactId
      ? payments.filter((p) => {
          const inv = customerInvoices.find((i) => i.id === p.customerInvoiceId);
          return inv?.customerId === activeCustomerContactId;
        })
      : payments;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-indigo-400" />
            Payments & Cash Receipts Register
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail for all incoming customer collections and outgoing vendor disbursements
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Payment No.</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type / Flow</th>
                <th className="py-3 px-4">Settled Against</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Bank Reference</th>
                <th className="py-3 px-4 text-right">Amount Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                displayedPayments.map((pay) => {
                  const isIncoming = pay.direction === 'incoming';
                  return (
                    <tr key={pay.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        {pay.paymentNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{pay.paymentDate}</td>
                      <td className="py-3.5 px-4">
                        {isIncoming ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="w-3 h-3" /> Incoming Receipt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ArrowUpRight className="w-3 h-3" /> Outgoing Vendor Bill
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {pay.paidAgainst === 'customer_invoice' ? 'Customer Invoice' : 'Vendor Bill'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          {pay.method === 'bank' ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Bank Wire
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {pay.reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        <span className={isIncoming ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncoming ? '+' : '-'}${pay.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
