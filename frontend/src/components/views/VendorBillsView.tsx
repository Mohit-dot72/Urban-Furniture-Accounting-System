import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { FileSpreadsheet, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export const VendorBillsView: React.FC = () => {
  const { vendorBills, registerBillPayment } = useAccounting();

  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('bank');

  const activeBill = vendorBills.find((b) => b.id === selectedBillId);

  const handleOpenPayment = (billId: string) => {
    const bill = vendorBills.find((b) => b.id === billId);
    if (!bill) return;
    const remaining = bill.totalAmount - bill.amountPaid;
    setSelectedBillId(billId);
    setPayAmount(remaining);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId || payAmount <= 0) return;
    registerBillPayment(selectedBillId, payAmount, payMethod);
    setSelectedBillId(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Vendor Bills (Accounts Payable)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule B: Bill recognition postings &bull; Rule A: Payment settlements
          </p>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bill Number</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Bill Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vendorBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No vendor bills yet. Convert a purchase order to generate one.
                  </td>
                </tr>
              ) : (
                vendorBills.map((bill) => {
                  const remaining = bill.totalAmount - bill.amountPaid;
                  return (
                    <tr key={bill.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-purple-400">
                        {bill.billNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {bill.vendor.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{bill.billDate}</td>
                      <td className="py-3.5 px-4 text-slate-400">{bill.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        ${bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                        ${bill.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-300">
                        ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {bill.paymentStatus === 'paid' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Paid in Full
                          </span>
                        )}
                        {bill.paymentStatus === 'partial' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Partially Paid
                          </span>
                        )}
                        {bill.paymentStatus === 'unpaid' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {bill.paymentStatus !== 'paid' ? (
                          <button
                            onClick={() => handleOpenPayment(bill.id)}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors active:scale-95 ml-auto"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Register Payment (Rule A)
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Registration Modal */}
      {selectedBillId && activeBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Register Vendor Payment</h3>
                <p className="text-xs text-indigo-400 font-mono">{activeBill.billNumber}</p>
              </div>
              <button
                onClick={() => setSelectedBillId(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Rule A Execution</p>
                <p className="text-[11px] text-purple-300/80">
                  This transaction will debit Accounts Payable and credit your selected Bank/Cash account in the double-entry journal!
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayMethod('bank')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      payMethod === 'bank'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Commercial Bank Wire
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('cash')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      payMethod === 'cash'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Petty Cash
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Payment Amount ($)</span>
                  <span className="text-slate-400">
                    Remaining:{' '}
                    <span className="text-rose-400 font-mono font-bold">
                      ${(activeBill.totalAmount - activeBill.amountPaid).toFixed(2)}
                    </span>
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  max={activeBill.totalAmount - activeBill.amountPaid}
                  min="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBillId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
