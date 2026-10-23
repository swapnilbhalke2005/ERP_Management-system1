import React from 'react';
import {
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { NavModule } from '../components/common/Sidebar';
import { Rupee } from '../components/common/CurrencySymbol';

interface DashboardViewProps {
  stats: any;
  onNavigate: (module: NavModule) => void;
  onOpenSheetsModal: () => void;
}

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigate,
  onOpenSheetsModal,
}) => {
  const kpis = stats?.kpis || {
    totalCustomers: 4,
    activeLeads: 4,
    totalSales: 327332,
    outstandingReceivables: 227332,
    outstandingPayables: 495600,
    totalExpenses: 42650,
    lowStockCount: 2,
    openProjects: 2,
    overdueTasks: 1,
    pendingApprovalsCount: 3,
  };

  const monthlySales = stats?.charts?.monthlySales || [];
  const expenseCategories = stats?.charts?.expenseCategories || [];
  const leadFunnel = stats?.charts?.leadFunnel || [];
  const recentAudits = stats?.recentAudits || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Welcome & Database Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Google Sheets Primary Database Engine Active
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Executive Business Operations</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time business performance across CRM, Sales, Multi-Warehouse Inventory, HR, and Double-Entry Finance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenSheetsModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Database Manager (56 Tables)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div
          onClick={() => onNavigate('sales')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Invoiced Sales</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Rupee className="w-5 h-5 text-slate-700 mr-1 shrink-0" />
            <span>{kpis.totalSales?.toLocaleString()}</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last quarter</span>
          </div>
        </div>

        {/* Card 2: Receivables */}
        <div
          onClick={() => onNavigate('sales')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Trade Receivables (AR)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <Rupee className="w-5 h-5 text-slate-700 mr-1 shrink-0" />
            <span>{kpis.outstandingReceivables?.toLocaleString()}</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Across active client accounts
          </p>
        </div>

        {/* Card 3: Active Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Pipeline Deals</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {kpis.activeLeads} <span className="text-xs font-normal text-slate-400">Open Leads</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {kpis.totalCustomers} Converted Enterprise Accounts
          </p>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div
          onClick={() => onNavigate('inventory')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Alerts</span>
            <div className={`p-2 rounded-xl ${kpis.lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {kpis.lowStockCount} <span className="text-xs font-normal text-slate-400">SKUs Low</span>
          </p>
          <p className="mt-2 text-xs text-rose-600 font-semibold">
            {kpis.lowStockCount > 0 ? 'Below reorder threshold' : 'All stock levels healthy'}
          </p>
        </div>
      </div>

      {/* Charts Section: Monthly Sales Bar & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Revenue Trend */}
        <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue vs Target</h3>
              <p className="text-xs text-slate-500">Invoiced performance across fiscal periods (INR)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
              FY 2026-27
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual Revenue" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operating Expenses</h3>
            <p className="text-xs text-slate-500 mb-4">Spending allocation by department ledger</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Expense']}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {expenseCategories.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="font-semibold font-mono flex items-center">
                  <Rupee className="w-2.5 h-2.5 mr-0.5" />
                  <span>{item.value?.toLocaleString()}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Lead Pipeline Funnel & Immutable Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Funnel */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales Conversion Funnel</h3>
              <p className="text-xs text-slate-500">Progression from lead capture to contract</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {leadFunnel.map((stage: any, idx: number) => {
              const maxCount = Math.max(...leadFunnel.map((s: any) => s.count || 1), 5);
              const pct = Math.round(((stage.count || 0) / maxCount) * 100);
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{stage.stage}</span>
                    <span className="font-mono text-slate-500">{stage.count} deals</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Trail Log */}
        <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Immutable Audit Trail</h3>
              <p className="text-xs text-slate-500">System changes tracked with user timestamp and IP</p>
            </div>
            <button
              onClick={() => onNavigate('database')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Worksheet Logs
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAudits.slice(0, 4).map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.user_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-semibold">
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">[{log.entity}]</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{log.details_json}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
