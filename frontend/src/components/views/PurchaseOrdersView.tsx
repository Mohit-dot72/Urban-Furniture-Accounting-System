import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { ShoppingCart, Plus, Check, ArrowRight, Trash2 } from 'lucide-react';

export const PurchaseOrdersView: React.FC = () => {
  const {
    purchaseOrders,
    contacts,
    products,
    analyticAccounts,
    createPurchaseOrder,
    confirmPurchaseOrder,
    convertPOToVendorBill,
  } = useAccounting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [lines, setLines] = useState<
    { productId: string; quantity: number; unitPrice: number; taxRate: number; analyticAccountId?: string }[]
  >([{ productId: products[0]?.id || '', quantity: 5, unitPrice: products[0]?.costPrice || 100, taxRate: 18, analyticAccountId: analyticAccounts[0]?.id }]);

  const vendors = contacts.filter((c) => c.type === 'vendor' || c.type === 'both');

  const handleAddLine = () => {
    setLines([
      ...lines,
      { productId: products[0]?.id || '', quantity: 1, unitPrice: products[0]?.costPrice || 100, taxRate: 18, analyticAccountId: analyticAccounts[0]?.id },
    ]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      productId,
      unitPrice: prod?.costPrice || 0,
    };
    setLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () =>
    lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const calculateTax = () =>
    lines.reduce((sum, l) => sum + (l.quantity * l.unitPrice * l.taxRate) / 100, 0);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      alert('Please select a vendor.');
      return;
    }
    createPurchaseOrder(selectedVendorId, lines);
    setIsModalOpen(false);
    setSelectedVendorId('');
    setLines([{ productId: products[0]?.id || '', quantity: 5, unitPrice: products[0]?.costPrice || 100, taxRate: 18, analyticAccountId: analyticAccounts[0]?.id }]);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            Purchase Orders
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Procurement lifecycle: Draft &rarr; Confirmed &rarr; Billed (Rule B Journal Entry)
          </p>
        </div>
        <button
          onClick={() => {
            if (vendors.length > 0 && !selectedVendorId) {
              setSelectedVendorId(vendors[0].id);
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => {
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                        {po.poNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {po.vendor.name}
                        <span className="block text-[10px] text-slate-500">{po.vendor.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{po.orderDate}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium">
                          {po.lineItems.length} item{po.lineItems.length > 1 ? 's' : ''}
                        </span>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">
                          {po.lineItems.map((li) => `${li.product?.name || 'Furniture Item'} (x${li.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {po.status === 'draft' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
                            Draft
                          </span>
                        )}
                        {po.status === 'confirmed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Confirmed
                          </span>
                        )}
                        {po.status === 'billed' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Billed (Invoiced)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {po.status === 'draft' && (
                            <button
                              onClick={() => confirmPurchaseOrder(po.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Confirm
                            </button>
                          )}
                          {po.status === 'confirmed' && (
                            <button
                              onClick={() => convertPOToVendorBill(po.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
                            >
                              <ArrowRight className="w-3 h-3" />
                              Convert to Bill (Rule B)
                            </button>
                          )}
                          {po.status === 'billed' && (
                            <span className="text-[11px] text-emerald-400 font-medium">
                              Journal Entry Generated
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

      {/* Create PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Purchase Order</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              {/* Vendor Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Select Furniture Vendor / Supplier *
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city || 'Vendor'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400">Order Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Product Line
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl grid grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="col-span-4">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Product</label>
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].quantity = Number(e.target.value);
                            setLines(updated);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].unitPrice = Number(e.target.value);
                            setLines(updated);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Cost Center</label>
                        <select
                          value={line.analyticAccountId || ''}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].analyticAccountId = e.target.value;
                            setLines(updated);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-200"
                        >
                          {analyticAccounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (18% GST):</span>
                  <span className="font-mono text-slate-200">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                  <span>Total Order Value:</span>
                  <span className="font-mono text-indigo-400">
                    ${(calculateSubtotal() + calculateTax()).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  Confirm & Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
