import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Scale,
  X,
  Building2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface FinanceViewProps {
  expenses: any[];
  accounts: any[];
  journalEntries: any[];
  employees: any[];
  onRefresh: () => void;
  onCreateExpense: (data: any) => Promise<void>;
  onUpdateExpenseStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
  onPostJournalEntry: (data: any) => Promise<void>;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  expenses,
  accounts,
  journalEntries,
  employees,
  onRefresh,
  onCreateExpense,
  onUpdateExpenseStatus,
  onPostJournalEntry,
}) => {
  const [tab, setTab] = useState<'expenses' | 'accounts' | 'journal'>('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // New Expense Claim State
  const [expenseForm, setExpenseForm] = useState({
    employeeId: employees[0]?.id || '',
    categoryName: 'Client Travel & Entertainment',
    amount: 5000,
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  // New Journal Entry State
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalRef, setJournalRef] = useState('');
  const [journalDesc, setJournalDesc] = useState('');
  const [journalLines, setJournalLines] = useState([
    { accountId: accounts[0]?.id || '', debit: 10000, credit: 0, lineMemo: 'Debit entry' },
    { accountId: accounts[1]?.id || '', debit: 0, credit: 10000, lineMemo: 'Credit entry' },
  ]);

  const totalDebit = journalLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredit = journalLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateExpense(expenseForm);
    setShowExpenseModal(false);
    setExpenseForm({
      employeeId: employees[0]?.id || '',
      categoryName: 'Client Travel & Entertainment',
      amount: 5000,
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    await onPostJournalEntry({
      entryDate: journalDate,
      reference: journalRef || 'Manual GL Entry',
      description: journalDesc || 'General Journal Entry',
      lines: journalLines,
    });
    setShowJournalModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Finance, Expenses &amp; General Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational spending claims, double-entry journal balance verification, and Chart of Accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('expenses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'expenses' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setTab('journal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'journal' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journal Entries ({journalEntries.length})
            </button>
            <button
              onClick={() => setTab('accounts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'accounts' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chart of Accounts ({accounts.length})
            </button>
          </div>

          {tab === 'journal' ? (
            <button
              onClick={() => setShowJournalModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Post Journal</span>
            </button>
          ) : (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Claim Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* EXPENSES TAB */}
      {tab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Operational Expense Claims</h3>
              <p className="text-xs text-slate-500">Employee reimbursement requests and operational vendor bills</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Claim #</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{exp.expense_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{exp.employee_name}</td>
                    <td className="py-3 px-4 text-slate-700">{exp.category_name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{exp.expense_date}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{exp.description}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{exp.amount?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : exp.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {exp.status === 'Pending_Approval' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateExpenseStatus(exp.id, 'Approved')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onUpdateExpenseStatus(exp.id, 'Rejected')}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold shadow-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOURNAL ENTRIES TAB */}
      {tab === 'journal' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">General Ledger Journal Entries</h3>
              <p className="text-xs text-slate-500">Double-entry accounting records with verified balanced debits &amp; credits</p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {journalEntries.map((jrn) => (
              <div key={jrn.id} className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 text-xs">{jrn.entry_number}</span>
                    <span className="text-xs font-bold text-slate-900">• {jrn.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Date: <strong>{jrn.entry_date}</strong></span>
                    <span className="font-mono">Ref: {jrn.reference}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                      {jrn.status}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto bg-slate-50/60 rounded-xl p-2 border border-slate-100">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">
                        <th className="py-1 px-3">Account</th>
                        <th className="py-1 px-3">Memo</th>
                        <th className="py-1 px-3 text-right">Debit (INR)</th>
                        <th className="py-1 px-3 text-right">Credit (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jrn.lines?.map((line: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-1 px-3 font-semibold text-slate-800">{line.account_name}</td>
                          <td className="py-1 px-3 text-slate-500 italic">{line.line_memo || '—'}</td>
                          <td className="py-1 px-3 text-right font-mono font-medium text-slate-900">
                            {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-1 px-3 text-right font-mono font-medium text-slate-900">
                            {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART OF ACCOUNTS TAB */}
      {tab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Standard Chart of Accounts</h3>
            <p className="text-xs text-slate-500">General ledger accounts classification hierarchy</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Sub-Type</th>
                  <th className="py-3 px-4 text-right">Current Balance (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{acc.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{acc.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{acc.sub_type}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{acc.current_balance?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLAIM EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Submit Operational Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claimant Employee *</label>
                <select
                  value={expenseForm.employeeId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, employeeId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseForm.categoryName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  <option value="Client Travel & Entertainment">Client Travel &amp; Entertainment</option>
                  <option value="Warehouse Logistics & Packaging">Warehouse Logistics &amp; Packaging</option>
                  <option value="Hardware & Office Equipment">Hardware &amp; Office Equipment</option>
                  <option value="Software SaaS & Cloud Hosting">Software SaaS &amp; Cloud</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Purpose / Description</label>
                <textarea
                  rows={2}
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Client meeting, spare parts purchase, flight receipt..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST JOURNAL ENTRY MODAL */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Post Double-Entry Journal Entry</h3>
              </div>
              <button onClick={() => setShowJournalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJournal} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entry Date</label>
                  <input
                    type="date"
                    required
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / Document #</label>
                  <input
                    type="text"
                    value={journalRef}
                    onChange={(e) => setJournalRef(e.target.value)}
                    placeholder="e.g. BANK-TRF-0912"
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Narration</label>
                <input
                  type="text"
                  required
                  value={journalDesc}
                  onChange={(e) => setJournalDesc(e.target.value)}
                  placeholder="Narration of the accounting transaction..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              {/* Journal Line 1 (Debit) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 text-[11px]">Line 1: Debit Account</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={journalLines[0]?.accountId}
                      onChange={(e) => {
                        const copy = [...journalLines];
                        copy[0].accountId = e.target.value;
                        setJournalLines(copy);
                      }}
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      value={journalLines[0]?.debit}
                      onChange={(e) => {
                        const copy = [...journalLines];
                        copy[0].debit = Number(e.target.value);
                        setJournalLines(copy);
                      }}
                      placeholder="Debit"
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Journal Line 2 (Credit) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 text-[11px]">Line 2: Credit Account</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={journalLines[1]?.accountId}
                      onChange={(e) => {
                        const copy = [...journalLines];
                        copy[1].accountId = e.target.value;
                        setJournalLines(copy);
                      }}
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      value={journalLines[1]?.credit}
                      onChange={(e) => {
                        const copy = [...journalLines];
                        copy[1].credit = Number(e.target.value);
                        setJournalLines(copy);
                      }}
                      placeholder="Credit"
                      className="w-full p-1.5 border border-slate-200 rounded-lg bg-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Live Balance Checker */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                  isBalanced
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div>
                  <span>Total Debit: <strong>₹{totalDebit.toLocaleString()}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Total Credit: <strong>₹{totalCredit.toLocaleString()}</strong></span>
                </div>
                <div className="font-bold">
                  {isBalanced ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Balanced</span>
                    </span>
                  ) : (
                    <span>Discrepancy: ₹{Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Post to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
