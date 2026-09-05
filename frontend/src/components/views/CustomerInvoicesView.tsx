import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { FileCheck2, DollarSign, CheckCircle2, AlertCircle, Printer } from 'lucide-react';

export const CustomerInvoicesView: React.FC = () => {
  const { customerInvoices, registerInvoicePayment, activeRole, activeCustomerContactId } = useAccounting();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('bank');
  const [printInvoiceId, setPrintInvoiceId] = useState<string | null>(null);

  // Scoping for customer portal role
  const displayedInvoices =
    activeRole === 'contact' && activeCustomerContactId
      ? customerInvoices.filter((i) => i.customerId === activeCustomerContactId)
      : customerInvoices;

  const activeInvoice = customerInvoices.find((i) => i.id === selectedInvoiceId);
  const invoiceToPrint = customerInvoices.find((i) => i.id === printInvoiceId);

  const handleOpenPayment = (invoiceId: string) => {
    const inv = customerInvoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const remaining = inv.totalAmount - inv.amountPaid;
    setSelectedInvoiceId(invoiceId);
    setPayAmount(remaining);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || payAmount <= 0) return;
    registerInvoicePayment(selectedInvoiceId, payAmount, payMethod);
    setSelectedInvoiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            Customer Invoices (Accounts Receivable)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule C: Revenue recognition &bull; Rule D: Cash collection & settlement
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No customer invoices found for this view.
                  </td>
                </tr>
              ) : (
                displayedInvoices.map((inv) => {
                  const remaining = inv.totalAmount - inv.amountPaid;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {inv.customer.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{inv.invoiceDate}</td>
                      <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                        ${inv.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-300">
                        ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {inv.paymentStatus === 'paid' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Paid in Full
                          </span>
                        )}
                        {inv.paymentStatus === 'partial' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Partially Paid
                          </span>
                        )}
                        {inv.paymentStatus === 'unpaid' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPrintInvoiceId(inv.id)}
                            title="Preview Printable Invoice"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {inv.paymentStatus !== 'paid' ? (
                            <button
                              onClick={() => handleOpenPayment(inv.id)}
                              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors active:scale-95"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              {activeRole === 'contact' ? 'Pay Now' : 'Record Receipt (Rule D)'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {selectedInvoiceId && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Record Customer Payment</h3>
                <p className="text-xs text-emerald-400 font-mono">{activeInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceId(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Rule D Execution</p>
                <p className="text-[11px] text-emerald-300/80">
                  This transaction will debit Bank/Cash and credit Accounts Receivable in the double-entry general ledger!
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Payment Destination / Method
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
                    Cash Register
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-400">Payment Amount ($)</span>
                  <span className="text-slate-400">
                    Remaining:{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      ${(activeInvoice.totalAmount - activeInvoice.amountPaid).toFixed(2)}
                    </span>
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  max={activeInvoice.totalAmount - activeInvoice.amountPaid}
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
                  onClick={() => setSelectedInvoiceId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Confirm & Post Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {invoiceToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-8 space-y-6 shadow-2xl text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">Urban Furniture Ltd</h2>
                <p className="text-xs text-slate-400">Contemporary Furnishings & Architectural Interior</p>
                <p className="text-[11px] text-slate-500 mt-1">Tax ID: GSTIN990231849 &bull; info@urbanfurniture.com</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-bold text-emerald-400 block">
                  {invoiceToPrint.invoiceNumber}
                </span>
                <span className="text-xs text-slate-400 block mt-1">Date: {invoiceToPrint.invoiceDate}</span>
                <span className="text-xs text-slate-400 block">Due: {invoiceToPrint.dueDate}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">Billed To:</span>
              <p className="font-bold text-slate-200 mt-0.5">{invoiceToPrint.customer.name}</p>
              <p className="text-xs text-slate-400">{invoiceToPrint.customer.email}</p>
              <p className="text-xs text-slate-400">{invoiceToPrint.customer.city}, {invoiceToPrint.customer.state}</p>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Tax (18%)</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoiceToPrint.lineItems.map((li) => (
                  <tr key={li.id}>
                    <td className="py-2 font-medium text-slate-200">{li.product?.name || 'Furniture Item'}</td>
                    <td className="py-2 text-center text-slate-400">{li.quantity}</td>
                    <td className="py-2 text-right font-mono">${li.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono">${(li.taxAmount ?? 0).toFixed(2)}</td>
                    <td className="py-2 text-right font-mono font-bold text-slate-100">${(li.total ?? li.quantity * li.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400">Payment Status: </span>
                <span className="text-xs font-bold uppercase text-emerald-400">{invoiceToPrint.paymentStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Due:</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  ${invoiceToPrint.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPrintInvoiceId(null)}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
