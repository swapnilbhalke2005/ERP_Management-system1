import React from 'react';
import { X, ShieldCheck, Check, User } from 'lucide-react';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Switch User Role</h2>
              <p className="text-xs text-slate-500">Test role-based access control and approval flows</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {users.map((u) => {
            const isSelected = u.id === currentUserId;
            return (
              <div
                key={u.id}
                onClick={() => {
                  onSelectUser(u.id);
                  onClose();
                }}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected ? 'bg-indigo-50/80 border border-indigo-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] font-semibold text-indigo-600">{u.role_name}</p>
                    <p className="text-[10px] text-slate-400">{u.department_name}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="p-1 rounded-full bg-indigo-600 text-white">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          OmniERP RBAC Engine enforces backend permission checks on every API action.
        </div>
      </div>
    </div>
  );
};
