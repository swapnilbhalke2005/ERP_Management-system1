import React, { useState, useEffect } from 'react';
import { Search, X, Users, Target, FileText, Package, ArrowRight } from 'lucide-react';
import { NavModule } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: NavModule) => void;
  customers: any[];
  leads: any[];
  invoices: any[];
  products: any[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  customers,
  leads,
  invoices,
  products,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCustomers = q
    ? customers.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 3)
    : customers.slice(0, 2);

  const filteredLeads = q
    ? leads.filter(l => l.company_name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)).slice(0, 3)
    : leads.slice(0, 2);

  const filteredInvoices = q
    ? invoices.filter(i => i.invoice_number.toLowerCase().includes(q) || i.customer_name.toLowerCase().includes(q)).slice(0, 3)
    : invoices.slice(0, 2);

  const filteredProducts = q
    ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 3)
    : products.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across customers, leads, invoices, inventory..."
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
              </div>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { onNavigate('customers'); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs group"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.id} • {c.city}, {c.state}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {filteredLeads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Target className="w-3.5 h-3.5" />
                <span>Leads</span>
              </div>
              <div className="space-y-1">
                {filteredLeads.map(l => (
                  <div
                    key={l.id}
                    onClick={() => { onNavigate('leads'); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs group"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600">{l.company_name}</p>
                      <p className="text-[11px] text-slate-400">Deal: ₹{l.deal_value?.toLocaleString()} • Stage: {l.stage}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                      {l.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </div>
              <div className="space-y-1">
                {filteredInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => { onNavigate('sales'); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs group"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600">{inv.invoice_number} - {inv.customer_name}</p>
                      <p className="text-[11px] text-slate-400">Total: ₹{inv.grand_total?.toLocaleString()} • Balance: ₹{inv.balance_due?.toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5" />
                <span>Products & SKU</span>
              </div>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { onNavigate('inventory'); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs group"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600">{p.name}</p>
                      <p className="text-[11px] text-slate-400">SKU: {p.sku} • Price: ₹{p.selling_price?.toLocaleString()}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">₹{p.selling_price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search OmniERP records</span>
          <div className="flex items-center gap-2">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
