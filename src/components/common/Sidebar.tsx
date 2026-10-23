import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  FileSpreadsheet,
  ShoppingCart,
  Boxes,
  Truck,
  UserCheck,
  Receipt,
  FolderKanban,
  Files,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export type NavModule =
  | 'dashboard'
  | 'customers'
  | 'leads'
  | 'sales'
  | 'inventory'
  | 'procurement'
  | 'hr'
  | 'finance'
  | 'projects'
  | 'documents'
  | 'database';

interface SidebarProps {
  currentModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, group: 'Overview' },
    { id: 'customers', label: 'Customers & Accounts', icon: Users, group: 'CRM' },
    { id: 'leads', label: 'Leads & Pipeline', icon: Target, group: 'CRM' },
    { id: 'sales', label: 'Sales & Invoices', icon: FileSpreadsheet, group: 'Commercial' },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, group: 'Supply Chain' },
    { id: 'procurement', label: 'Procurement & POs', icon: Truck, group: 'Supply Chain' },
    { id: 'hr', label: 'Human Resources', icon: UserCheck, group: 'Organization' },
    { id: 'finance', label: 'Finance & Ledger', icon: Receipt, group: 'Financials' },
    { id: 'projects', label: 'Projects & Tasks', icon: FolderKanban, group: 'Operations' },
    { id: 'documents', label: 'Company Documents', icon: Files, group: 'Operations' },
    { id: 'database', label: 'Google Sheets DB', icon: Database, group: 'System' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-slate-900 text-slate-300 z-50 md:z-20 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-lg shadow-inner">
              Ω
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-white text-base tracking-tight">Omni<span className="text-indigo-400">ERP</span></span>
                <span className="text-[10px] block text-slate-400 font-mono">v2.4 • Enterprise</span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="p-1 rounded text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id as NavModule);
                  if (onCloseMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Database & Security Footer */}
        <div className="p-3 border-t border-slate-800">
          {!isCollapsed ? (
            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">Sheets Engine v4</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                56 worksheets structured schema.
              </p>
            </div>
          ) : (
            <div className="flex justify-center p-2 text-emerald-400" title="Google Sheets Engine v4 active">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}

          {/* Collapse desktop toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full mt-2 hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
