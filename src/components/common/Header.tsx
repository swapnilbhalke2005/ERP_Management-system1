import React, { useState } from 'react';
import {
  Search,
  Bell,
  Database,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Building2,
  Menu
} from 'lucide-react';

interface HeaderProps {
  currentUser: any;
  sheetsStatus: any;
  onOpenSheetsModal: () => void;
  onOpenUserSwitchModal: () => void;
  onOpenSearchModal: () => void;
  onToggleSidebar?: () => void;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  sheetsStatus,
  onOpenSheetsModal,
  onOpenUserSwitchModal,
  onOpenSearchModal,
  onToggleSidebar,
  notifications,
  onMarkNotificationRead,
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadNotifs = notifications.filter(n => !n.is_read);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Organization info */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
            Ω
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Apex Global Enterprise</h1>
            <p className="text-xs text-slate-500 font-medium">OmniERP Cloud Edition</p>
          </div>
        </div>
      </div>

      {/* Middle: Global Search bar trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={onOpenSearchModal}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search customers, invoices, leads, inventory...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded text-slate-500 font-mono shadow-xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile search button */}
        <button
          onClick={onOpenSearchModal}
          aria-label="Open search"
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 sm:hidden"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Database Status Button */}
        <button
          onClick={onOpenSheetsModal}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            sheetsStatus?.connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Click to view Google Sheets Cloud Database configuration"
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">
            {sheetsStatus?.connected ? 'Google Sheets Live' : 'Demo DB (Sheets Mode)'}
          </span>
          <span className="md:hidden">
            {sheetsStatus?.connected ? 'Live' : 'Demo'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              sheetsStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
        </button>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            aria-label="Open notifications"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications ({unreadNotifs.length})</span>
                <span className="text-[11px] text-slate-400">In-App Alerts</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-400">No new alerts</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-xs transition-colors ${
                        !n.is_read ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Session & Role Switcher */}
        <button
          onClick={onOpenUserSwitchModal}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
        >
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{currentUser?.name}</p>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{currentUser?.role_name}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </button>
      </div>
    </header>
  );
};
