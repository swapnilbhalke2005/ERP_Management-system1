import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Download,
  ExternalLink,
  Key,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetsStatus: any;
  onTestConnection: () => Promise<void>;
  onInitializeSheets: () => Promise<void>;
  onExportDatabase: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  sheetsStatus,
  onTestConnection,
  onInitializeSheets,
  onExportDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'guide' | 'schema'>('status');
  const [testing, setTesting] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initResult, setInitResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    try {
      await onTestConnection();
    } finally {
      setTesting(false);
    }
  };

  const handleInit = async () => {
    setInitializing(true);
    setInitResult(null);
    try {
      await onInitializeSheets();
      setInitResult('Synchronization complete: verified all 56 worksheets and header rows.');
    } catch (err: unknown) {
      setInitResult(err instanceof Error ? err.message : String(err));
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Google Sheets Database Engine</h2>
              <p className="text-xs text-slate-500">Persistent storage architecture &amp; Cloud service account synchronization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4 gap-4 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'status' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-700'
            }`}
          >
            Connection &amp; Health
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'guide' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-700'
            }`}
          >
            10-Step Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'schema' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-slate-700'
            }`}
          >
            56 Worksheets Architecture
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  sheetsStatus?.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {sheetsStatus?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      {sheetsStatus?.connected
                        ? 'Google Sheets Live Database Connected'
                        : 'Running in In-Memory Demo Mode'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sheetsStatus?.connected ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {sheetsStatus?.mode}
                    </span>
                  </div>
                  <p className="mt-1 text-xs opacity-90">
                    {sheetsStatus?.connected
                      ? `Connected to Spreadsheet ID: ${sheetsStatus.spreadsheetId} (${sheetsStatus.spreadsheetTitle || 'OmniERP'}). All transactions sync live.`
                      : 'No live Google Cloud service account credentials detected in environment. Operating in full-featured Demo Mode with operational seed data and strict schema validation.'}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[11px] text-slate-400 font-medium">Worksheet Schemas</p>
                  <p className="text-lg font-bold text-slate-800 mt-0.5">56 / 56</p>
                  <p className="text-[10px] text-slate-500">Fully defined</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[11px] text-slate-400 font-medium">Formula Protection</p>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5">Active</p>
                  <p className="text-[10px] text-slate-500">CSV sanitization enabled</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-slate-400 font-medium">Last Checked</p>
                  <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                    {new Date(sheetsStatus?.lastChecked || Date.now()).toLocaleTimeString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Automatic polling</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>

                <button
                  onClick={handleInit}
                  disabled={initializing}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Layers className={`w-3.5 h-3.5 ${initializing ? 'animate-spin' : ''}`} />
                  <span>{initializing ? 'Synchronizing...' : 'Initialize / Verify 56 Sheets'}</span>
                </button>

                <button
                  onClick={onExportDatabase}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Database (JSON)</span>
                </button>
              </div>

              {initResult && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                  {initResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                To connect OmniERP to a live Google Sheet, follow these steps in Google Cloud Console:
              </p>
              <ol className="space-y-2 list-decimal list-inside text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                <li>Create or select a Google Cloud Project in Google Cloud Console.</li>
                <li>Enable the <strong>Google Sheets API v4</strong> and <strong>Google Drive API</strong>.</li>
                <li>Navigate to <strong>IAM &amp; Admin &gt; Service Accounts</strong> and create a dedicated service account (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">erp-sheets-agent@project.iam.gserviceaccount.com</code>).</li>
                <li>Generate a private key in JSON format and download it safely.</li>
                <li>Create a new, blank Google Spreadsheet in your Google Drive and name it <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Apex Enterprise ERP Database</code>.</li>
                <li>Copy the Spreadsheet ID from the browser URL (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">docs.google.com/spreadsheets/d/&#123;SPREADSHEET_ID&#125;/edit</code>).</li>
                <li>Click <strong>Share</strong> on the spreadsheet and add your service account email with <strong>Editor</strong> permissions.</li>
                <li>Set the following environment variables in your deployment (.env):
                  <div className="mt-2 bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
                    <div>GOOGLE_SERVICE_ACCOUNT_EMAIL="your-agent@project.iam.gserviceaccount.com"</div>
                    <div>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB...-----END PRIVATE KEY-----\n"</div>
                    <div>GOOGLE_SHEETS_SPREADSHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"</div>
                  </div>
                </li>
                <li>Click <strong>Test Connection</strong> to verify live authentication.</li>
                <li>Click <strong>Initialize / Verify 56 Sheets</strong> to automatically create all worksheets with headers!</li>
              </ol>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">56 Structured Enterprise Worksheets</span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Strict column definitions, primary keys, and relations</p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-mono font-bold text-xs">
                  56 Tables
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">Core (1-10)</p>
                  <p className="text-slate-600">Users, Roles, Permissions, Company_Settings, Departments, Audit_Logs, Sequence_Counters, Notifications, Attachments, Import_Export_Logs</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">CRM (11-16)</p>
                  <p className="text-slate-600">Customers, Customer_Contacts, Leads, Lead_Activities, Follow_Ups, Customer_Interactions</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">Sales &amp; Invoices (17-26)</p>
                  <p className="text-slate-600">Products_Services, Price_Lists, Quotations, Quotation_Items, Sales_Orders, Sales_Order_Items, Invoices, Invoice_Items, Payments, Credit_Notes</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">Inventory &amp; SCM (27-36)</p>
                  <p className="text-slate-600">Warehouses, Inventory, Inventory_Movements, Stock_Adjustments, Suppliers, Purchase_Orders, Purchase_Order_Items, Goods_Receipts, Supplier_Bills, Supplier_Payments</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">Human Resources (37-42)</p>
                  <p className="text-slate-600">Employees, Attendance, Leave_Requests, Payroll_Records, Employee_Documents, Performance_Reviews</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-800 mb-1">Finance &amp; Accounts (43-50)</p>
                  <p className="text-slate-600">Expenses, Expense_Categories, Accounts, Journal_Entries, Journal_Entry_Lines, Budgets, Tax_Rates, Financial_Periods</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg sm:col-span-2">
                  <p className="font-bold text-slate-800 mb-1">Projects &amp; Operations (51-56)</p>
                  <p className="text-slate-600">Projects, Tasks, Project_Timesheets, Service_Requests, Company_Assets, Maintenance_Records</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">OmniERP Repository Abstraction</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
