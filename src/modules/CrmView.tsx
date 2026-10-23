import React, { useState } from 'react';
import {
  Users,
  Target,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  CreditCard,
  Briefcase,
} from 'lucide-react';

interface CrmViewProps {
  initialTab?: 'customers' | 'leads';
  customers: any[];
  leads: any[];
  onRefresh: () => void;
  onCreateCustomer: (data: any) => Promise<void>;
  onCreateLead: (data: any) => Promise<void>;
  onUpdateLeadStage: (id: string, stage: string) => Promise<void>;
  onConvertLead: (id: string) => Promise<void>;
}

export const CrmView: React.FC<CrmViewProps> = ({
  initialTab = 'customers',
  customers,
  leads,
  onRefresh,
  onCreateCustomer,
  onCreateLead,
  onUpdateLeadStage,
  onConvertLead,
}) => {
  const [tab, setTab] = useState<'customers' | 'leads'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);

  // New Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    primary_contact: '',
    email: '',
    phone: '',
    billing_address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    gstin: '',
    industry: 'Technology',
    payment_terms: 'Net 30',
    credit_limit: 1000000,
    notes: '',
  });

  // New Lead Form State
  const [leadForm, setLeadForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    stage: 'New',
    lead_source: 'Inbound Web',
    deal_value: 500000,
    notes: '',
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateCustomer(customerForm);
    setShowAddCustomerModal(false);
    setCustomerForm({
      name: '',
      primary_contact: '',
      email: '',
      phone: '',
      billing_address: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      gstin: '',
      industry: 'Technology',
      payment_terms: 'Net 30',
      credit_limit: 1000000,
      notes: '',
    });
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateLead(leadForm);
    setShowAddLeadModal(false);
    setLeadForm({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      stage: 'New',
      lead_source: 'Inbound Web',
      deal_value: 500000,
      notes: '',
    });
  };

  const handleConvertLead = async (leadId: string) => {
    setConvertingLeadId(leadId);
    try {
      await onConvertLead(leadId);
    } finally {
      setConvertingLeadId(null);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const STAGES = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">CRM &amp; Client Relations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer directories, credit terms, pipeline leads, and 1-click conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'customers' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customers ({customers.length})
            </button>
            <button
              onClick={() => setTab('leads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'leads' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leads Pipeline ({leads.length})
            </button>
          </div>

          {tab === 'customers' ? (
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMERS TAB */}
      {tab === 'customers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, account ID, or contact email..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-indigo-600 font-medium"
              />
            </div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-600 font-medium"
            >
              <option value="All">All Industries</option>
              <option value="Pharmaceuticals & Biotech">Pharmaceuticals</option>
              <option value="Automotive & EV">Automotive &amp; EV</option>
              <option value="Logistics & Warehousing">Logistics</option>
              <option value="Robotics & AI">Robotics &amp; AI</option>
            </select>
          </div>

          {/* Customers Cards / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">{c.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{c.industry}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded">
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.primary_contact || 'Main Contact'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.city}, {c.state}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Credit Limit</span>
                    <p className="font-bold text-slate-800 flex items-baseline">
                      <span className="font-sans text-[11px] font-bold mr-0.5">₹</span>
                      <span>{Number(c.credit_limit).toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">GSTIN</span>
                    <p className="font-mono text-slate-600 text-[11px]">{c.gstin || 'Unregistered'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADS PIPELINE KANBAN */}
      {tab === 'leads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              return (
                <div key={stage} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 min-w-[220px]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-mono text-slate-400">{lead.id}</span>
                          <span className="text-xs font-black text-indigo-700 flex items-baseline">
                            <span className="font-sans text-[11px] font-bold mr-0.5">₹</span>
                            <span>{Number(lead.deal_value).toLocaleString()}</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">{lead.company_name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{lead.contact_name}</p>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-1.5 rounded">
                          "{lead.notes || 'In discussion regarding supply requirements.'}"
                        </p>

                        {/* Stage transition controls & Convert button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {lead.stage !== 'Won' ? (
                            <>
                              <button
                                onClick={() => handleConvertLead(lead.id)}
                                disabled={convertingLeadId === lead.id}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs disabled:opacity-50"
                                title="Convert Lead into active Customer record"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{convertingLeadId === lead.id ? 'Converting...' : 'Convert to Client'}</span>
                              </button>

                              {/* Next stage button */}
                              {stage !== 'Won' && (
                                <button
                                  onClick={() => {
                                    const nextIdx = STAGES.indexOf(stage) + 1;
                                    if (nextIdx < STAGES.length) {
                                      onUpdateLeadStage(lead.id, STAGES[nextIdx]);
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  title="Advance to next pipeline stage"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="w-full text-center py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Converted Account</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add New Enterprise Customer</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. Reliance Tech Works Ltd"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Contact Person</label>
                  <input
                    type="text"
                    value={customerForm.primary_contact}
                    onChange={(e) => setCustomerForm({ ...customerForm, primary_contact: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={customerForm.gstin}
                    onChange={(e) => setCustomerForm({ ...customerForm, gstdin: e.target.value })}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={customerForm.city}
                    onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit (INR)</label>
                  <input
                    type="number"
                    value={customerForm.credit_limit}
                    onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Pipeline Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.company_name}
                  onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })}
                  placeholder="e.g. Mahindra Electric"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={leadForm.contact_name}
                    onChange={(e) => setLeadForm({ ...leadForm, contact_name: e.target.value })}
                    placeholder="Contact name"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deal Value (INR)</label>
                  <input
                    type="number"
                    value={leadForm.deal_value}
                    onChange={(e) => setLeadForm({ ...leadForm, deal_value: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Notes &amp; Scope</label>
                <textarea
                  rows={3}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Requirements, timeline, hardware specifications..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
