import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Rupee } from './CurrencySymbol';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  companySettings: any;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  companySettings,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal bar */}
        <div className="p-3 px-6 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold">Official GST Tax Invoice Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button onClick={onClose} className="p-1 rounded text-slate-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 sm:p-12 text-slate-800 space-y-6 bg-white font-sans text-xs">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                  Ω
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  {companySettings?.company_name || 'Apex Global Enterprise Ltd.'}
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                {companySettings?.address || 'Tech Park One, Tower B, Level 8'}<br />
                {companySettings?.city || 'Mumbai'}, {companySettings?.state || 'Maharashtra'} - {companySettings?.country || 'India'}<br />
                <strong>GSTIN:</strong> {companySettings?.tax_id_gstin || '27AABCA1234F1Z8'}<br />
                Email: {companySettings?.email || 'accounts@apexcorp.com'}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[11px] mb-2">
                Tax Invoice
              </span>
              <p className="text-lg font-black text-slate-900 font-mono">{invoice.invoice_number}</p>
              <p className="text-slate-500 text-[11px]">Date: <strong>{invoice.invoice_date}</strong></p>
              <p className="text-slate-500 text-[11px]">Due Date: <strong>{invoice.due_date}</strong></p>
              <p className="text-slate-500 text-[11px]">Status: <strong className="uppercase">{invoice.status}</strong></p>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6">
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Billed To</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer_name}</p>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Customer ID: {invoice.customer_id}<br />
                Place of Supply: {invoice.is_inter_state === 'true' ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Invoice Notes &amp; Terms</p>
              <p className="text-slate-600 text-[11px] leading-relaxed italic">
                {invoice.notes || 'Payment due within 30 days of invoice date. Bank transfer details: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0000123'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5">HSN/SAC</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Unit Rate</th>
                <th className="py-2.5 text-right">Tax Rate</th>
                <th className="py-2.5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item: any, idx: number) => (
                  <tr key={idx} className="text-[11px]">
                    <td className="py-2.5 font-medium text-slate-800">{item.item_description || 'Product'}</td>
                    <td className="py-2.5 text-slate-500 font-mono">{item.hsn_code || '85176290'}</td>
                    <td className="py-2.5 text-right font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{item.unit_price?.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-slate-500">{item.tax_rate_percent || 18}%</td>
                    <td className="py-2.5 text-right font-semibold font-mono text-slate-900">
                      <Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{item.line_total?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-[11px]">
                  <td className="py-2.5 font-medium text-slate-800">Commercial Goods / Services Order</td>
                  <td className="py-2.5 text-slate-500 font-mono">85176290</td>
                  <td className="py-2.5 text-right font-mono">1</td>
                  <td className="py-2.5 text-right font-mono"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.subtotal?.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-slate-500">18%</td>
                  <td className="py-2.5 text-right font-semibold font-mono text-slate-900">
                    <Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.subtotal?.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary & Tax Breakdown */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-72 space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-medium"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.subtotal?.toLocaleString()}</span>
              </div>
              {invoice.is_inter_state === 'true' ? (
                <div className="flex justify-between text-slate-600">
                  <span>IGST (18%):</span>
                  <span className="font-mono font-medium"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.igst_amount?.toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono font-medium"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.cgst_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono font-medium"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.sgst_amount?.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-slate-600 border-b border-slate-100 pb-2">
                <span>Total Statutory Tax:</span>
                <span className="font-mono font-medium"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.total_tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-700 font-bold"><Rupee className="w-3.5 h-3.5 inline-block mr-0.5" />{invoice.grand_total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono"><Rupee className="w-2.5 h-2.5 inline-block mr-0.5" />{invoice.paid_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className="font-mono"><Rupee className="w-3 h-3 inline-block mr-0.5" />{invoice.balance_due?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signoff & Stamp */}
          <div className="pt-10 flex justify-between items-end border-t border-slate-200">
            <div className="text-[10px] text-slate-400">
              <p>This is a computer-generated tax invoice issued via OmniERP Cloud.</p>
              <p>Primary Persistent Database: Google Sheets (Worksheet: Invoices)</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-400 pb-8" />
              <p className="text-[10px] font-bold text-slate-700 mt-1 uppercase tracking-wider">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
