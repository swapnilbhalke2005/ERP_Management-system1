import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Calendar,
  User,
  X,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: any[];
  tasks: any[];
  onRefresh: () => void;
  onCreateTask: (data: any) => Promise<void>;
  onUpdateTaskStatus: (id: string, status: string) => Promise<void>;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  onRefresh,
  onCreateTask,
  onUpdateTaskStatus,
}) => {
  const [tab, setTab] = useState<'tasks' | 'projects'>('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);

  // New Task State
  const [taskForm, setTaskForm] = useState({
    project_id: projects[0]?.id || '',
    title: '',
    description: '',
    assigned_to: 'Alex Morgan',
    priority: 'High',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    estimated_hours: 8,
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === taskForm.project_id);
    await onCreateTask({
      ...taskForm,
      project_name: proj?.name || 'General Project',
    });
    setShowTaskModal(false);
    setTaskForm({
      project_id: projects[0]?.id || '',
      title: '',
      description: '',
      assigned_to: 'Alex Morgan',
      priority: 'High',
      due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      estimated_hours: 8,
    });
  };

  const TASK_STATUSES = ['To_Do', 'In_Progress', 'In_Review', 'Completed'];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Project Delivery &amp; Task Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliverable tracking, engineering timesheets, client milestones, and task Kanban.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'tasks' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task Kanban ({tasks.length})
            </button>
            <button
              onClick={() => setTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'projects' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Projects ({projects.length})
            </button>
          </div>

          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* TASK KANBAN TAB */}
      {tab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {TASK_STATUSES.map((statusKey) => {
            const columnTasks = tasks.filter((t) => t.status === statusKey);
            const statusLabel = statusKey.replace('_', ' ');
            return (
              <div key={statusKey} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 min-w-[240px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{statusLabel}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-mono text-slate-400">{task.id}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700'
                              : task.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-snug">{task.title}</h4>
                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{task.project_name}</p>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[100px]">{task.assigned_to}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.due_date}</span>
                        </div>
                      </div>

                      {/* Status movement triggers */}
                      <div className="pt-1.5 flex justify-end gap-1">
                        {statusKey !== 'Completed' && (
                          <button
                            onClick={() => {
                              const nextIdx = TASK_STATUSES.indexOf(statusKey) + 1;
                              if (nextIdx < TASK_STATUSES.length) {
                                onUpdateTaskStatus(task.id, TASK_STATUSES[nextIdx]);
                              }
                            }}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROJECTS LIST TAB */}
      {tab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                      {proj.project_code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">{proj.name}</h3>
                    <p className="text-[11px] text-slate-500">{proj.customer_name}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{proj.description}</p>

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>Deliverable Progress</span>
                    <span className="font-mono">{proj.completion_percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${proj.completion_percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Budget (INR)</span>
                  <p className="font-mono font-bold text-slate-900">₹{Number(proj.budget).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Lead Manager</span>
                  <p className="font-semibold text-slate-700">{proj.manager_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Project Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Project *</label>
                <select
                  value={taskForm.project_id}
                  onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600 font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Calibrate sensor telemetry board"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={taskForm.estimated_hours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Task scope and deliverables..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
