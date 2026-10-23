import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, NavModule } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { UserSwitchModal } from './components/common/UserSwitchModal';
import { GoogleSheetsModal } from './components/common/GoogleSheetsModal';
import { InvoicePrintModal } from './components/common/InvoicePrintModal';

import { DashboardView } from './modules/DashboardView';
import { CrmView } from './modules/CrmView';
import { SalesView } from './modules/SalesView';
import { InventoryView } from './modules/InventoryView';
import { ProcurementView } from './modules/ProcurementView';
import { HrView } from './modules/HrView';
import { FinanceView } from './modules/FinanceView';
import { ProjectsView } from './modules/ProjectsView';
import { DocumentsView } from './modules/DocumentsView';
import { DatabaseView } from './modules/DatabaseView';

import { api } from './services/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<NavModule>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [showUserSwitchModal, setShowUserSwitchModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState<any | null>(null);

  // Application Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sheetsStatus, setSheetsStatus] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load All System Data
  const refreshAllData = useCallback(async () => {
    try {
      const [
        meRes,
        usersRes,
        statusRes,
        statsRes,
        custRes,
        leadsRes,
        prodRes,
        quoteRes,
        invRes,
        soRes,
        stockRes,
        movRes,
        whRes,
        supRes,
        poRes,
        empRes,
        leaveRes,
        expRes,
        accRes,
        jrnRes,
        projRes,
        taskRes,
        docRes,
        notifRes,
        compRes,
      ] = await Promise.all([
        api.getCurrentUser(),
        api.getUsers(),
        api.getSheetsStatus(),
        api.getDashboardStats(),
        api.getCustomers(),
        api.getLeads(),
        api.getProducts(),
        api.getQuotations(),
        api.getInvoices(),
        api.getSalesOrders(),
        api.getInventory(),
        api.getStockMovements(),
        api.getWarehouses(),
        api.getSuppliers(),
        api.getPurchaseOrders(),
        api.getEmployees(),
        api.getLeaveRequests(),
        api.getExpenses(),
        api.getAccounts(),
        api.getJournalEntries(),
        api.getProjects(),
        api.getTasks(),
        api.getDocuments(),
        api.getNotifications(),
        api.getCompanySettings(),
      ]);

      setCurrentUser(meRes.user);
      setUsers(usersRes);
      setSheetsStatus(statusRes);
      setStats(statsRes);
      setCustomers(custRes);
      setLeads(leadsRes);
      setProducts(prodRes);
      setQuotations(quoteRes);
      setInvoices(invRes);
      setSalesOrders(soRes);
      setInventory(stockRes);
      setStockMovements(movRes);
      setWarehouses(whRes);
      setSuppliers(supRes);
      setPurchaseOrders(poRes);
      setEmployees(empRes);
      setLeaveRequests(leaveRes);
      setExpenses(expRes);
      setAccounts(accRes);
      setJournalEntries(jrnRes);
      setProjects(projRes);
      setTasks(taskRes);
      setDocuments(docRes);
      setNotifications(notifRes);
      setCompanySettings(compRes);
      setError(null);
    } catch (err: unknown) {
      console.error('Data load error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handlers
  const handleSwitchUser = async (userId: string) => {
    try {
      await api.switchUser(userId);
      await refreshAllData();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleTestConnection = async () => {
    const status = await api.testSheetsConnection();
    setSheetsStatus(status);
  };

  const handleInitializeSheets = async () => {
    await api.initializeSheets();
    await handleTestConnection();
  };

  const handleExportDatabase = () => {
    window.location.href = api.getDatabaseExportUrl();
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  // CRM Actions
  const handleCreateCustomer = async (data: any) => {
    await api.createCustomer(data);
    await refreshAllData();
  };

  const handleCreateLead = async (data: any) => {
    await api.createLead(data);
    await refreshAllData();
  };

  const handleUpdateLeadStage = async (id: string, stage: string) => {
    await api.updateLeadStage(id, stage);
    await refreshAllData();
  };

  const handleConvertLead = async (id: string) => {
    await api.convertLeadToCustomer(id);
    await refreshAllData();
  };

  // Sales Actions
  const handleCreateQuotation = async (data: any) => {
    await api.createQuotation(data);
    await refreshAllData();
  };

  const handleApproveQuotation = async (id: string) => {
    await api.approveQuotation(id);
    await refreshAllData();
  };

  const handleConvertQuotationToOrder = async (id: string) => {
    await api.convertQuotationToOrder(id);
    await refreshAllData();
  };

  const handleCreateInvoice = async (data: any) => {
    await api.createInvoice(data);
    await refreshAllData();
  };

  const handleRecordPayment = async (invoiceId: string, data: any) => {
    await api.recordPayment(invoiceId, data);
    await refreshAllData();
  };

  // Inventory Actions
  const handleCreateProduct = async (data: any) => {
    await api.createProduct(data);
    await refreshAllData();
  };

  const handleRecordStockMovement = async (data: any) => {
    await api.recordStockMovement(data);
    await refreshAllData();
  };

  // Procurement Actions
  const handleCreatePurchaseOrder = async (data: any) => {
    await api.createPurchaseOrder(data);
    await refreshAllData();
  };

  const handleReceiveGoods = async (poId: string, warehouseId?: string) => {
    await api.receiveGoods(poId, warehouseId);
    await refreshAllData();
  };

  // HR Actions
  const handleCreateLeaveRequest = async (data: any) => {
    await api.createLeaveRequest(data);
    await refreshAllData();
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    await api.updateLeaveStatus(id, status);
    await refreshAllData();
  };

  // Finance Actions
  const handleCreateExpense = async (data: any) => {
    await api.createExpense(data);
    await refreshAllData();
  };

  const handleUpdateExpenseStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    await api.updateExpenseStatus(id, status);
    await refreshAllData();
  };

  const handlePostJournalEntry = async (data: any) => {
    await api.postJournalEntry(data);
    await refreshAllData();
  };

  // Project Actions
  const handleCreateTask = async (data: any) => {
    await api.createTask(data);
    await refreshAllData();
  };

  const handleUpdateTaskStatus = async (id: string, status: string) => {
    await api.updateTaskStatus(id, status);
    await refreshAllData();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <div className="text-center">
          <h2 className="text-base font-extrabold tracking-tight">Initializing OmniERP Engine</h2>
          <p className="text-xs text-slate-400 mt-1">Mounting 56 structured Google Sheets database schemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content View Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentUser={currentUser}
            sheetsStatus={sheetsStatus}
            onOpenSheetsModal={() => setShowSheetsModal(true)}
            onOpenUserSwitchModal={() => setShowUserSwitchModal(true)}
            onOpenSearchModal={() => setShowSearchModal(true)}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={refreshAllData}
                  className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded hover:bg-rose-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {currentModule === 'dashboard' && (
              <DashboardView
                stats={stats}
                onNavigate={setCurrentModule}
                onOpenSheetsModal={() => setShowSheetsModal(true)}
              />
            )}

            {currentModule === 'customers' && (
              <CrmView
                initialTab="customers"
                customers={customers}
                leads={leads}
                onRefresh={refreshAllData}
                onCreateCustomer={handleCreateCustomer}
                onCreateLead={handleCreateLead}
                onUpdateLeadStage={handleUpdateLeadStage}
                onConvertLead={handleConvertLead}
              />
            )}

            {currentModule === 'leads' && (
              <CrmView
                initialTab="leads"
                customers={customers}
                leads={leads}
                onRefresh={refreshAllData}
                onCreateCustomer={handleCreateCustomer}
                onCreateLead={handleCreateLead}
                onUpdateLeadStage={handleUpdateLeadStage}
                onConvertLead={handleConvertLead}
              />
            )}

            {currentModule === 'sales' && (
              <SalesView
                quotations={quotations}
                invoices={invoices}
                salesOrders={salesOrders}
                customers={customers}
                products={products}
                onRefresh={refreshAllData}
                onCreateQuotation={handleCreateQuotation}
                onApproveQuotation={handleApproveQuotation}
                onConvertQuotationToOrder={handleConvertQuotationToOrder}
                onCreateInvoice={handleCreateInvoice}
                onRecordPayment={handleRecordPayment}
                onOpenInvoicePrint={(inv) => setPrintingInvoice(inv)}
              />
            )}

            {currentModule === 'inventory' && (
              <InventoryView
                products={products}
                inventory={inventory}
                stockMovements={stockMovements}
                warehouses={warehouses}
                onRefresh={refreshAllData}
                onCreateProduct={handleCreateProduct}
                onRecordStockMovement={handleRecordStockMovement}
              />
            )}

            {currentModule === 'procurement' && (
              <ProcurementView
                purchaseOrders={purchaseOrders}
                suppliers={suppliers}
                products={products}
                warehouses={warehouses}
                onRefresh={refreshAllData}
                onCreatePurchaseOrder={handleCreatePurchaseOrder}
                onReceiveGoods={handleReceiveGoods}
              />
            )}

            {currentModule === 'hr' && (
              <HrView
                employees={employees}
                leaveRequests={leaveRequests}
                onRefresh={refreshAllData}
                onCreateLeaveRequest={handleCreateLeaveRequest}
                onUpdateLeaveStatus={handleUpdateLeaveStatus}
              />
            )}

            {currentModule === 'finance' && (
              <FinanceView
                expenses={expenses}
                accounts={accounts}
                journalEntries={journalEntries}
                employees={employees}
                onRefresh={refreshAllData}
                onCreateExpense={handleCreateExpense}
                onUpdateExpenseStatus={handleUpdateExpenseStatus}
                onPostJournalEntry={handlePostJournalEntry}
              />
            )}

            {currentModule === 'projects' && (
              <ProjectsView
                projects={projects}
                tasks={tasks}
                onRefresh={refreshAllData}
                onCreateTask={handleCreateTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            )}

            {currentModule === 'documents' && (
              <DocumentsView documents={documents} />
            )}

            {currentModule === 'database' && (
              <DatabaseView
                sheetsStatus={sheetsStatus}
                onRefreshStatus={refreshAllData}
                onOpenSetupModal={() => setShowSheetsModal(true)}
                onExportDatabase={handleExportDatabase}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onNavigate={setCurrentModule}
        customers={customers}
        leads={leads}
        invoices={invoices}
        products={products}
      />

      <UserSwitchModal
        isOpen={showUserSwitchModal}
        onClose={() => setShowUserSwitchModal(false)}
        users={users}
        currentUserId={currentUser?.id}
        onSelectUser={handleSwitchUser}
      />

      <GoogleSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        sheetsStatus={sheetsStatus}
        onTestConnection={handleTestConnection}
        onInitializeSheets={handleInitializeSheets}
        onExportDatabase={handleExportDatabase}
      />

      <InvoicePrintModal
        isOpen={Boolean(printingInvoice)}
        onClose={() => setPrintingInvoice(null)}
        invoice={printingInvoice}
        companySettings={companySettings}
      />
    </div>
  );
}
