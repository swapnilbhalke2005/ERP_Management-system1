/**
 * OmniERP Frontend API Client
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Database & Sheets
  getSheetsStatus: () => fetchJson<any>('/sheets/status'),
  testSheetsConnection: () => fetchJson<any>('/sheets/test', { method: 'POST' }),
  initializeSheets: () => fetchJson<any>('/sheets/initialize', { method: 'POST' }),
  getWorksheetSchemas: () => fetchJson<{ totalWorksheets: number; worksheets: any[] }>('/sheets/schemas'),
  getDatabaseExportUrl: () => `${API_BASE}/sheets/export`,

  // Auth & Roles
  getCurrentUser: () => fetchJson<{ user: any; permissions: string[] }>('/auth/me'),
  getUsers: () => fetchJson<any[]>('/auth/users'),
  switchUser: (userId: string) => fetchJson<any>('/auth/switch-user', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Dashboard
  getDashboardStats: () => fetchJson<any>('/dashboard/stats'),

  // CRM & Leads
  getCustomers: (search?: string, industry?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (industry && industry !== 'All') params.append('industry', industry);
    return fetchJson<any[]>(`/customers?${params.toString()}`);
  },
  createCustomer: (data: any) => fetchJson<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  getLeads: () => fetchJson<any[]>('/leads'),
  createLead: (data: any) => fetchJson<any>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLeadStage: (id: string, stage: string) => fetchJson<any>(`/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
  convertLeadToCustomer: (id: string) => fetchJson<any>(`/leads/${id}/convert`, { method: 'POST' }),

  // Sales
  getProducts: () => fetchJson<any[]>('/products'),
  createProduct: (data: any) => fetchJson<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  getQuotations: () => fetchJson<any[]>('/quotations'),
  createQuotation: (data: any) => fetchJson<any>('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  approveQuotation: (id: string) => fetchJson<any>(`/quotations/${id}/approve`, { method: 'POST' }),
  convertQuotationToOrder: (id: string) => fetchJson<any>(`/quotations/${id}/convert`, { method: 'POST' }),
  getSalesOrders: () => fetchJson<any[]>('/sales-orders'),
  getInvoices: () => fetchJson<any[]>('/invoices'),
  createInvoice: (data: any) => fetchJson<any>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (invoiceId: string, data: any) => fetchJson<any>(`/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(data) }),

  // Inventory & Procurement
  getWarehouses: () => fetchJson<any[]>('/warehouses'),
  getInventory: () => fetchJson<any[]>('/inventory'),
  getStockMovements: () => fetchJson<any[]>('/inventory/movements'),
  recordStockMovement: (data: any) => fetchJson<any>('/inventory/movements', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => fetchJson<any[]>('/suppliers'),
  getPurchaseOrders: () => fetchJson<any[]>('/purchase-orders'),
  createPurchaseOrder: (data: any) => fetchJson<any>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  receiveGoods: (poId: string, warehouseId?: string) => fetchJson<any>(`/purchase-orders/${poId}/receive`, { method: 'POST', body: JSON.stringify({ warehouseId }) }),

  // Human Resources
  getEmployees: () => fetchJson<any[]>('/employees'),
  getLeaveRequests: () => fetchJson<any[]>('/leave-requests'),
  createLeaveRequest: (data: any) => fetchJson<any>('/leave-requests', { method: 'POST', body: JSON.stringify(data) }),
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => fetchJson<any>(`/leave-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Finance & General Ledger
  getExpenses: () => fetchJson<any[]>('/finance/expenses'),
  createExpense: (data: any) => fetchJson<any>('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpenseStatus: (id: string, status: 'Approved' | 'Rejected') => fetchJson<any>(`/finance/expenses/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAccounts: () => fetchJson<any[]>('/finance/accounts'),
  getJournalEntries: () => fetchJson<any[]>('/finance/journal-entries'),
  postJournalEntry: (data: any) => fetchJson<any>('/finance/journal-entries', { method: 'POST', body: JSON.stringify(data) }),

  // Projects & Operations
  getProjects: () => fetchJson<any[]>('/projects'),
  getTasks: (projectId?: string) => fetchJson<any[]>(`/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  createTask: (data: any) => fetchJson<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTaskStatus: (id: string, status: string) => fetchJson<any>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Audit, Notifications & Settings
  getAuditLogs: () => fetchJson<any[]>('/audit-logs'),
  getNotifications: () => fetchJson<any[]>('/notifications'),
  markNotificationRead: (id: string) => fetchJson<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  getCompanySettings: () => fetchJson<any>('/company-settings'),
  getDocuments: () => fetchJson<any[]>('/documents'),
};
