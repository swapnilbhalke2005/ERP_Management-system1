import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  DollarSign,
  ArrowRight,
  Sparkles,
  X,
  CreditCard,
  Building2,
  Calendar,
} from 'lucide-react';

interface SalesViewProps {
  quotations: any[];
  invoices: any[];
  salesOrders: any[];
  customers: any[];
  products: any[];
  onRefresh: () => void;
  onCreateQuotation: (data: any) => Promise<void>;
  onApproveQuotation: (id: string) => Promise<void>;
  onConvertQuotationToOrder: (id: string) => Promise<void>;
  onCreateInvoice: (data: any) => Promise<void>;
  onRecordPayment: (invoiceId: string, data: any) => Promise<void>;
  onOpenInvoicePrint: (invoice: any) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  quotations,
  invoices,
  salesOrders,
  customers,
  products,
  onRefresh,
  onCreateQuotation,
  onApproveQuotation,
  onConvertQuotationToOrder,
  onCreateInvoice,
  onRecordPayment,
  onOpenInvoicePrint,
}) => {
  const [tab, setTab] = useState<'quotations' | 'invoices' | 'orders'>('invoices');
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);

  // Quote form state
  const [quoteCustomerId, setQuoteCustomerId] = useState(customers[0]?.id || '');
  const [quoteItems, setQuoteItems] = useState([
    { productId: products[0]?.id || '', quantity: 2, unitPrice: products[0]?.selling_price || 10000, discountPercent: 0, taxRatePercent: 18 }
  ]);
  const [quoteNotes, setQuoteNotes] = useState('');

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('NEFT / RTGS Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateQuotation({
      customerId: quoteCustomerId,
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      items: quoteItems,
      notes: quoteNotes,
    });
    setShowCreateQuoteModal(false);
  };

  const handleOpenPayment = (inv: any) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(inv.balance_due);
    setPaymentRef(`HDFC-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    await onRecordPayment(selectedInvoiceForPayment.id, {
      amount: Number(paymentAmount),
      paymentMode,
      referenceNumber: paymentRef,
      notes: `Settlement payment received`,
    });
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Sales &amp; Commercial Invoicing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quotations workflow, approval cycle, sales orders, GST invoices, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('invoices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'invoices' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setTab('quotations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'quotations' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quotations ({quotations.length})
            </button>
            <button
              onClick={() => setTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'orders' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Orders ({salesOrders.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateQuoteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* INVOICES TAB */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tax Invoices Register</h3>
              <p className="text-xs text-slate-500">Legal GST tax invoices issued to client organizations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Tax Total</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoice_number}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{inv.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{inv.customer_id}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.invoice_date}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.due_date}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">₹{inv.subtotal?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">₹{inv.total_tax?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{inv.grand_total?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      ₹{inv.balance_due?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenInvoicePrint(inv)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                          title="Print official GST tax invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {inv.balance_due > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                            title="Record payment against this invoice"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUOTATIONS TAB */}
      {tab === 'quotations' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Commercial Quotations</h3>
              <p className="text-xs text-slate-500">Proposals submitted to leads and clients with approval workflows</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{quote.quotation_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{quote.customer_name}</td>
                    <td className="py-3 px-4 text-slate-600">{quote.quotation_date}</td>
                    <td className="py-3 px-4 text-slate-600">{quote.expiry_date}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{quote.subtotal?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{quote.grand_total?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          quote.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : quote.status === 'Converted'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {quote.status === 'Pending_Approval' || quote.status === 'Draft' ? (
                          <button
                            onClick={() => onApproveQuotation(quote.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px]"
                          >
                            Approve
                          </button>
                        ) : null}

                        {quote.status === 'Approved' && !quote.converted_order_id ? (
                          <button
                            onClick={() => onConvertQuotationToOrder(quote.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Convert to SO</span>
                          </button>
                        ) : null}

                        {quote.converted_order_id && (
                          <span className="text-[10px] text-slate-400 font-mono">{quote.converted_order_id}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SALES ORDERS TAB */}
      {tab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Confirmed Sales Orders</h3>
              <p className="text-xs text-slate-500">Commercial agreements scheduled for fulfillment and dispatch</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">SO #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Target Delivery</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{so.order_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{so.customer_name}</td>
                    <td className="py-3 px-4 text-slate-600">{so.order_date}</td>
                    <td className="py-3 px-4 text-slate-600">{so.delivery_date}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{so.grand_total?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {so.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {showCreateQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Prepare New Commercial Quotation</h3>
              <button onClick={() => setShowCreateQuoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Customer / Account *</label>
                <select
                  value={quoteCustomerId}
                  onChange={(e) => setQuoteCustomerId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Item Line</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={quoteItems[0]?.productId}
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        setQuoteItems([
                          {
                            productId: e.target.value,
                            quantity: quoteItems[0]?.quantity || 1,
                            unitPrice: prod?.selling_price || 10000,
                            discountPercent: 0,
                            taxRatePercent: 18,
                          },
                        ]);
                      }}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={quoteItems[0]?.quantity}
                      onChange={(e) =>
                        setQuoteItems([
                          { ...quoteItems[0], quantity: Math.max(1, Number(e.target.value)) },
                        ])
                      }
                      placeholder="Qty"
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commercial Notes &amp; Validity</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="30-day price validity, delivery within 10 days of signoff..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateQuoteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Payment Receipt</h3>
                <p className="text-xs text-slate-500">{selectedInvoiceForPayment.invoice_number}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Client</span>
                  <p className="font-bold text-slate-800">{selectedInvoiceForPayment.customer_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Due</span>
                  <p className="font-mono font-black text-rose-600 text-sm">
                    ₹{selectedInvoiceForPayment.balance_due?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allocated Payment Amount (INR) *</label>
                <input
                  type="number"
                  required
                  max={selectedInvoiceForPayment.balance_due}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-indigo-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  <option value="NEFT / RTGS Bank Transfer">NEFT / RTGS Bank Transfer</option>
                  <option value="UPI / Corporate Immediate Payment">UPI / IMPS</option>
                  <option value="Cheque / Draft">Corporate Cheque</option>
                  <option value="Credit Card">Corporate Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Reference / UTR Number</label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-900">
                Recording payment will automatically post a balanced double-entry journal (Debit: Cash/Bank, Credit: Accounts Receivable) to General Ledger.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Post Payment &amp; Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
