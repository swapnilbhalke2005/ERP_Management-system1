import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  Search,
  Package,
  Layers,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface InventoryViewProps {
  products: any[];
  inventory: any[];
  stockMovements: any[];
  warehouses: any[];
  onRefresh: () => void;
  onCreateProduct: (data: any) => Promise<void>;
  onRecordStockMovement: (data: any) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  inventory,
  stockMovements,
  warehouses,
  onRefresh,
  onCreateProduct,
  onRecordStockMovement,
}) => {
  const [tab, setTab] = useState<'stock' | 'products' | 'movements'>('stock');
  const [search, setSearch] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Add Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Industrial Electronics',
    type: 'Product',
    cost_price: 15000,
    selling_price: 25000,
    tax_rate_percent: 18,
    hsn_code: '85176290',
    description: '',
  });

  // Movement Form
  const [movementForm, setMovementForm] = useState({
    productId: products[0]?.id || '',
    movementType: 'IN' as 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST',
    fromWarehouseId: warehouses[0]?.id || '',
    toWarehouseId: warehouses[0]?.id || '',
    quantity: 10,
    referenceDocType: 'Manual_Adjustment',
    referenceDocId: `ADJ-${Date.now().toString().slice(-6)}`,
    notes: 'Warehouse physical count reconciliation',
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateProduct(productForm);
    setShowAddProductModal(false);
    setProductForm({
      name: '',
      sku: '',
      category: 'Industrial Electronics',
      type: 'Product',
      cost_price: 15000,
      selling_price: 25000,
      tax_rate_percent: 18,
      hsn_code: '85176290',
      description: '',
    });
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRecordStockMovement({
      ...movementForm,
      quantity: Number(movementForm.quantity),
    });
    setShowMovementModal(false);
  };

  const filteredInventory = inventory.filter((inv) =>
    inv.product_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.warehouse_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Inventory &amp; Multi-Warehouse Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict stock movement ledger, warehouse balances, reorder points, and catalog management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'stock' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock on Hand ({inventory.length})
            </button>
            <button
              onClick={() => setTab('movements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'movements' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Movement Ledger ({stockMovements.length})
            </button>
            <button
              onClick={() => setTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'products' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catalog ({products.length})
            </button>
          </div>

          <button
            onClick={() => setShowMovementModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Record Movement</span>
          </button>

          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* STOCK LEVELS TAB */}
      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter stock by product name or warehouse hub..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-indigo-600 font-medium"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Warehouse Depot</th>
                    <th className="py-3 px-4 text-right">On Hand</th>
                    <th className="py-3 px-4 text-right">Reserved</th>
                    <th className="py-3 px-4 text-right">Available</th>
                    <th className="py-3 px-4 text-right">Reorder Threshold</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Valuation (INR)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const isLow = item.quantity_on_hand <= item.reorder_level;
                    const available = item.quantity_on_hand - (item.quantity_reserved || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.product_id}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.warehouse_name}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {item.quantity_on_hand}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">
                          {item.quantity_reserved || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                          {available}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">{item.reorder_level}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">₹{item.unit_cost?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ₹{item.total_value?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Low Stock</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              Optimal
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
      )}

      {/* MOVEMENT LEDGER TAB */}
      {tab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory Movement Ledger</h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of all stock receipts, issues, transfers, and corrections.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Movement #</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{mov.movement_number}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(mov.timestamp).toLocaleDateString()} {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          mov.movement_type === 'IN'
                            ? 'bg-emerald-50 text-emerald-700'
                            : mov.movement_type === 'OUT'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {mov.movement_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{mov.product_name}</td>
                    <td className="py-3 px-4 text-slate-600">{mov.from_warehouse_name || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{mov.to_warehouse_name || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{mov.quantity}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{mov.reference_doc_id}</td>
                    <td className="py-3 px-4 text-slate-600">{mov.logged_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">{p.name}</h3>
                    <p className="text-[11px] text-slate-500">{p.category}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">{p.uom}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cost Price</span>
                  <p className="font-mono text-slate-700">₹{p.cost_price?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Selling Price</span>
                  <p className="font-mono font-bold text-indigo-600 text-sm">₹{p.selling_price?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Item to Product Catalog</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Dual-Core Programmable PLC"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="PLC-MOD-01"
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (INR)</label>
                  <input
                    type="number"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (INR)</label>
                  <input
                    type="number"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MOVEMENT MODAL */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Record Stock Movement</h3>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordMovement} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product *</label>
                <select
                  value={movementForm.productId}
                  onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Movement Type</label>
                  <select
                    value={movementForm.movementType}
                    onChange={(e: any) => setMovementForm({ ...movementForm, movementType: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-semibold"
                  >
                    <option value="IN">IN (Stock Receipt)</option>
                    <option value="OUT">OUT (Issue / Dispatch)</option>
                    <option value="TRANSFER">TRANSFER (Inter-Warehouse)</option>
                    <option value="ADJUST">ADJUST (Audit Correction)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Warehouse</label>
                  <select
                    value={movementForm.toWarehouseId}
                    onChange={(e) => setMovementForm({ ...movementForm, toWarehouseId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference Doc</label>
                  <input
                    type="text"
                    value={movementForm.referenceDocId}
                    onChange={(e) => setMovementForm({ ...movementForm, referenceDocId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Post Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
