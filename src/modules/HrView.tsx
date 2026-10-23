import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  Clock,
  X,
} from 'lucide-react';

interface HrViewProps {
  employees: any[];
  leaveRequests: any[];
  onRefresh: () => void;
  onCreateLeaveRequest: (data: any) => Promise<void>;
  onUpdateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

export const HrView: React.FC<HrViewProps> = ({
  employees,
  leaveRequests,
  onRefresh,
  onCreateLeaveRequest,
  onUpdateLeaveStatus,
}) => {
  const [tab, setTab] = useState<'employees' | 'leaves'>('employees');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Leave Form
  const [leaveEmployeeId, setLeaveEmployeeId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState('Paid Annual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState(3);
  const [reason, setReason] = useState('Personal leave');

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateLeaveRequest({
      employeeId: leaveEmployeeId,
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays),
      reason,
    });
    setShowLeaveModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Human Resources &amp; People Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Employee profiles, departmental structures, attendance tracking, and leave approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('employees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'employees' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employees Directory ({employees.length})
            </button>
            <button
              onClick={() => setTab('leaves')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'leaves' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leave Requests ({leaveRequests.length})
            </button>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* EMPLOYEES TAB */}
      {tab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                      {emp.employee_code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                      {emp.first_name} {emp.last_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">{emp.designation}</p>
                    <p className="text-[10px] text-slate-400">{emp.department_name}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                    {emp.employment_status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Joined: {emp.joining_date}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Compensation</span>
                  <p className="font-mono font-bold text-slate-800">₹{Number(emp.base_salary).toLocaleString()} /mo</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Emergency</span>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{emp.emergency_contact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEAVES TAB */}
      {tab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leave Applications &amp; Approvals</h3>
              <p className="text-xs text-slate-500">Employee paid time off, sick leaves, and manager approval status</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Leave ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-center">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{leave.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{leave.employee_name}</td>
                    <td className="py-3 px-4 text-slate-700">{leave.leave_type}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {leave.start_date} → {leave.end_date}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{leave.total_days}</td>
                    <td className="py-3 px-4 text-slate-600 italic max-w-xs truncate">"{leave.reason}"</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : leave.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {leave.status === 'Pending_Approval' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateLeaveStatus(leave.id, 'Approved')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onUpdateLeaveStatus(leave.id, 'Rejected')}
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

      {/* APPLY LEAVE MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Submit Leave Application</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={leaveEmployeeId}
                  onChange={(e) => setLeaveEmployeeId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  <option value="Paid Annual Leave">Paid Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for leave..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
