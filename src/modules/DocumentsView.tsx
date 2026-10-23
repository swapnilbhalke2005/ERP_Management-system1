import React, { useState } from 'react';
import {
  Files,
  Plus,
  FileText,
  ExternalLink,
  Shield,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';

interface DocumentsViewProps {
  documents: any[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ documents }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Enterprise Document Vault</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud file references stored in Google Sheets with Google Drive persistent object storage.
          </p>
        </div>
      </div>

      {/* Info notice */}
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Google Sheets Storage Security Protocol:</span>
          <p className="mt-0.5 text-indigo-800 leading-relaxed">
            In compliance with ERP architecture rules, large binary PDFs and contracts are referenced via Google Drive IDs rather than storing base64 bloat inside spreadsheet cells. All file pointers are access-controlled.
          </p>
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
            placeholder="Search documents by title or filename..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-indigo-600 font-medium"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-indigo-600 font-medium"
        >
          <option value="All">All Categories</option>
          <option value="Contracts">Contracts</option>
          <option value="Company Policies">Company Policies</option>
          <option value="Invoices">Invoices &amp; Receipts</option>
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                  {doc.category}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 leading-snug">{doc.title}</h4>
              <p className="text-xs text-slate-500 font-mono mt-1">{doc.file_name}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700">{doc.file_size}</span>
                <span className="mx-1.5">•</span>
                <span>{doc.uploaded_by}</span>
              </div>
              <button
                onClick={() => alert(`Simulating secure verified download of ${doc.file_name} from Google Drive ID: ${doc.drive_id}`)}
                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
              >
                <span>Access</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
