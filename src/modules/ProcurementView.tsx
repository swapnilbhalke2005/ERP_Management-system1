import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Boxes,
  CheckCircle2,
  Clock,
  ArrowRight,
  PackageCheck,
  Building2,
  Mail,
  Phone,
  X,
  Sparkles,
} from 'lucide-react';

interface ProcurementViewProps {
  purchaseOrders: any[];
  suppliers: any[];
  products: any[];
  warehouses: any[];
  onRefresh: () => void;
  onCreatePurchaseOrder: (data: any) => Promise<void>;
  onReceiveGoods: (poId: string, warehouseId?: string) => Promise<void>;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  purchaseOrders,
  suppliers,
  products,
  warehouses,
  onRefresh,
  onCreatePurchaseOrder,
  onReceiveGoods,
}) => {
  const [tab, setTab] = useState<'orders' | 'suppliers'>('orders');
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [receivingPoId, setReceivingPoId] = useState<string | null>(null);

  // New PO State
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poWarehouseId, setPoWarehouseId] = useState(warehouses[0]?.id || '');
  const [poItems, setPoItems] = useState([
    { productId: products[1]?.id || '', quantity: 15, unitCost: products[1]?.cost_price || 20000 },
  ]);
  const [poNotes, setPoNotes] = useState('');

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreatePurchaseOrder({
      supplierId: poSupplierId,
      expectedDelivery: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      items: poItems,
      notes: poNotes,
    });
    setShowCreatePoModal(false);
  };

  const handleReceive = async (poId: string) => {
    setReceivingPoId(poId);
    try {
      await onReceiveGoods(poId, poWarehouseId);
    } finally {
      setReceivingPoId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Procurement &amp; Supplier Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vendor catalogs, purchase orders, approval gates, and physical Goods Receipt Notes (GRN).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'orders' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setTab('suppliers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'suppliers' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suppliers Directory ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreatePoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* PURCHASE ORDERS TAB */}
      {tab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Outbound Purchase Orders</h3>
              <p className="text-xs text-slate-500">Official POs issued to manufacturing vendors and hardware distributors</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Grand Total (INR)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{po.po_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{po.supplier_name}</td>
                    <td className="py-3 px-4 text-slate-600">{po.order_date}</td>
                    <td className="py-3 px-4 text-slate-600">{po.expected_delivery}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{po.subtotal?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{po.grand_total?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          po.status === 'Received'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status !== 'Received' ? (
                        <button
                          onClick={() => handleReceive(po.id)}
                          disabled={receivingPoId === po.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs disabled:opacity-50 inline-flex"
                          title="Generate Goods Receipt Note (GRN) and auto-increment warehouse stock ledger"
                        >
                          <PackageCheck className="w-3 h-3" />
                          <span>{receivingPoId === po.id ? 'Receiving...' : 'Receive Goods (GRN)'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Stock Received</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPLIERS TAB */}
      {tab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                      {sup.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">{sup.name}</h3>
                    <p className="text-[11px] text-slate-500">{sup.contact_person}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                    ★ {sup.rating || 5}.0
                  </span>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sup.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Terms</span>
                  <p className="font-semibold text-slate-700">{sup.payment_terms}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Credit Limit</span>
                  <p className="font-mono font-bold text-slate-800">₹{Number(sup.credit_limit).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PO MODAL */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Issue Purchase Order</h3>
              <button onClick={() => setShowCreatePoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Supplier *</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.payment_terms})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Warehouse</label>
                <select
                  value={poWarehouseId}
                  onChange={(e) => setPoWarehouseId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Item &amp; Quantity</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={poItems[0]?.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        setPoItems([
                          {
                            productId: e.target.value,
                            quantity: poItems[0]?.quantity || 10,
                            unitCost: prod?.cost_price || 15000,
                          },
                        ]);
                      }}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (Cost: ₹{p.cost_price?.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={poItems[0]?.quantity}
                      onChange={(e) =>
                        setPoItems([
                          { ...poItems[0], quantity: Math.max(1, Number(e.target.value)) },
                        ])
                      }
                      placeholder="Qty"
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Procurement Notes</label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Batch inspection required upon delivery..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
