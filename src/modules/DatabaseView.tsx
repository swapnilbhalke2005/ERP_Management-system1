import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Download,
  Search,
  ExternalLink,
  ShieldAlert,
  Server,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api';

interface DatabaseViewProps {
  sheetsStatus: any;
  onRefreshStatus: () => void;
  onOpenSetupModal: () => void;
  onExportDatabase: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  sheetsStatus,
  onRefreshStatus,
  onOpenSetupModal,
  onExportDatabase,
}) => {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSheet, setSelectedSheet] = useState<any | null>(null);

  useEffect(() => {
    api.getWorksheetSchemas()
      .then((res) => {
        setSchemas(res.worksheets || []);
        if (res.worksheets && res.worksheets.length > 0) {
          setSelectedSheet(res.worksheets[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Core', 'CRM', 'Sales', 'Inventory & Procurement', 'Human Resources', 'Finance & Expenses', 'Projects & Operations'];

  const filteredSchemas = schemas.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Google Sheets Database Architecture</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            56 Structured Worksheets, Column Type Contracts, Formula Sanitization &amp; Migration Path.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSetupModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Connection &amp; Health Setup</span>
          </button>

          <button
            onClick={onExportDatabase}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Backup Export</span>
          </button>
        </div>
      </div>

      {/* Connectivity Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          sheetsStatus?.connected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl text-white shrink-0 ${
              sheetsStatus?.connected ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm">
                {sheetsStatus?.connected
                  ? 'Active Google Cloud Service Account Persistence'
                  : 'Operating in High-Fidelity Demo Database Mode'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-current">
                {sheetsStatus?.mode || 'Demo'}
              </span>
            </div>
            <p className="text-xs mt-1 opacity-90 max-w-2xl">
              {sheetsStatus?.connected
                ? `Synchronizing with Google Spreadsheet ID: ${sheetsStatus.spreadsheetId}. All CRUD mutations stream into individual worksheet tabs.`
                : 'Transactions are processed against an in-memory repository conforming strictly to all 56 Google Sheets schemas with formula injection escaping. Connect a Service Account anytime to switch to live cloud storage.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500">Defined Tables</span>
            <p className="font-mono font-black text-lg text-slate-900">56 / 56</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemas by worksheet name or purpose..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-indigo-600 font-medium"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-600 font-medium"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Main Schema Browser & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Worksheets */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs lg:col-span-1 max-h-[600px] flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Worksheets ({filteredSchemas.length})</span>
            <span className="text-[11px] text-slate-400">Click to inspect</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredSchemas.map((sheet, idx) => {
              const isSelected = selectedSheet?.name === sheet.name;
              return (
                <div
                  key={sheet.name}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`p-3 cursor-pointer text-xs transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">#{idx + 1}</span>
                      <span className="font-bold text-slate-900">{sheet.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{sheet.category}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {sheet.columns.length} cols
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Inspector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs lg:col-span-2 space-y-4">
          {selectedSheet ? (
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    {selectedSheet.category} Worksheet
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1 font-mono">{selectedSheet.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedSheet.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Key</span>
                  <p className="font-mono font-bold text-indigo-600 text-xs mt-0.5">{selectedSheet.primaryKey}</p>
                </div>
              </div>

              {/* Column list */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Defined Columns ({selectedSheet.columns.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedSheet.columns.map((col: string, idx: number) => (
                    <div
                      key={col}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <span className="font-mono text-slate-800 font-semibold truncate">{col}</span>
                      <span className="text-[9px] font-mono text-slate-400 ml-1">col {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formula Sanitization Note */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1 mt-6">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Formula Injection Sanitization Guaranteed
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Values written to <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">{selectedSheet.name}</code> starting with <code className="font-mono">=, +, -, @</code> are escaped with a single quote prefix so Google Sheets interprets them strictly as literals.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">Select a worksheet on the left to inspect its schema.</p>
          )}
        </div>
      </div>

      {/* Migration Roadmap Note (Section 19 of prompt requirement) */}
      <div className="p-5 bg-slate-900 rounded-2xl text-slate-300 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          <h4 className="font-bold text-white text-sm">PostgreSQL / Cloud SQL Future Migration Roadmap</h4>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          OmniERP is engineered with a strict <strong>Repository Abstraction Layer</strong> (<code className="text-slate-300 font-mono">ErpRepository</code>). Because foreign keys and collision-resistant IDs (<code className="text-slate-300 font-mono">CUS-000001</code>, <code className="text-slate-300 font-mono">INV-000001</code>) are enforced in the application layer rather than relying on spreadsheet row coordinates, migrating from Google Sheets to PostgreSQL requires swapping the underlying storage adapter without changing business rules or UI modules.
        </p>
      </div>
    </div>
  );
};
