/**
 * OmniERP REST API Router
 * Comprehensive endpoints for all 56 worksheets and business modules
 */

import { Router, Request, Response } from 'express';
import { erpRepo } from '../db/repository';
import { googleSheetsService } from '../db/sheetsService';
import { ERP_WORKSHEETS } from '../db/schema';
import { getSheetsConfig } from '../config/sheetsConfig';

export const apiRouter = Router();

// ==========================================
// 1. SYSTEM, HEALTH & GOOGLE SHEETS DATABASE
// ==========================================

apiRouter.get('/sheets/status', async (_req: Request, res: Response) => {
  const status = await googleSheetsService.testConnection();
  res.json({
    ...status,
    databaseType: status.connected ? 'Google Sheets Cloud Database' : 'In-Memory Enterprise Demo Database (Google Sheets Compatible)',
    totalDefinedSchemas: ERP_WORKSHEETS.length,
  });
});

apiRouter.post('/sheets/test', async (_req: Request, res: Response) => {
  googleSheetsService.initClient();
  const status = await googleSheetsService.testConnection();
  res.json(status);
});

apiRouter.post('/sheets/initialize', async (_req: Request, res: Response) => {
  const result = await googleSheetsService.initializeSpreadsheet();
  res.json(result);
});

apiRouter.get('/sheets/schemas', (_req: Request, res: Response) => {
  res.json({
    totalWorksheets: ERP_WORKSHEETS.length,
    worksheets: ERP_WORKSHEETS,
  });
});

apiRouter.get('/sheets/export', (_req: Request, res: Response) => {
  const pkg = erpRepo.exportFullDatabasePackage();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="OmniERP_Database_Backup.json"');
  res.json(pkg);
});

// ==========================================
// 2. AUTHENTICATION & USERS
// ==========================================

apiRouter.get('/auth/me', (_req: Request, res: Response) => {
  res.json({
    user: erpRepo.currentUser,
    permissions: erpRepo.currentUser.role_name === 'Super Admin' ? ['*'] : ['view', 'create', 'edit', 'export'],
  });
});

apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  res.json(erpRepo.users);
});

apiRouter.get('/auth/roles', (_req: Request, res: Response) => {
  res.json(erpRepo.roles);
});

apiRouter.post('/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const success = erpRepo.setCurrentUser(userId);
  if (!success) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, user: erpRepo.currentUser });
});

// ==========================================
// 3. EXECUTIVE DASHBOARD & ANALYTICS
// ==========================================

apiRouter.get('/dashboard/stats', (_req: Request, res: Response) => {
  const stats = erpRepo.getDashboardStats();
  res.json(stats);
});

// ==========================================
// 4. CRM & LEADS
// ==========================================

apiRouter.get('/customers', (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const industry = req.query.industry as string | undefined;
  const customers = erpRepo.getCustomers(search, industry);
  res.json(customers);
});

apiRouter.get('/customers/:id', (req: Request, res: Response) => {
  const customer = erpRepo.getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

apiRouter.post('/customers', (req: Request, res: Response) => {
  try {
    const customer = erpRepo.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.patch('/customers/:id', (req: Request, res: Response) => {
  const customer = erpRepo.updateCustomer(req.params.id, req.body);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

apiRouter.get('/leads', (_req: Request, res: Response) => {
  res.json(erpRepo.getLeads());
});

apiRouter.post('/leads', (req: Request, res: Response) => {
  try {
    const lead = erpRepo.createLead(req.body);
    res.status(201).json(lead);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.patch('/leads/:id/stage', (req: Request, res: Response) => {
  const { stage } = req.body;
  const lead = erpRepo.updateLeadStage(req.params.id, stage);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json(lead);
});

apiRouter.post('/leads/:id/convert', (req: Request, res: Response) => {
  try {
    const result = erpRepo.convertLeadToCustomer(req.params.id);
    res.json(result);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ==========================================
// 5. SALES & ORDERS & INVOICES
// ==========================================

apiRouter.get('/products', (_req: Request, res: Response) => {
  res.json(erpRepo.getProducts());
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const product = erpRepo.createProduct(req.body);
    res.status(201).json(product);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/quotations', (_req: Request, res: Response) => {
  res.json(erpRepo.getQuotations());
});

apiRouter.post('/quotations', (req: Request, res: Response) => {
  try {
    const quotation = erpRepo.createQuotation(req.body);
    res.status(201).json(quotation);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/quotations/:id/approve', (req: Request, res: Response) => {
  try {
    const quote = erpRepo.approveQuotation(req.params.id);
    res.json(quote);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/quotations/:id/convert', (req: Request, res: Response) => {
  try {
    const so = erpRepo.convertQuotationToSalesOrder(req.params.id);
    res.json(so);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/sales-orders', (_req: Request, res: Response) => {
  res.json(erpRepo.salesOrders);
});

apiRouter.get('/invoices', (_req: Request, res: Response) => {
  res.json(erpRepo.getInvoices());
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  try {
    const invoice = erpRepo.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/invoices/:id/payments', (req: Request, res: Response) => {
  try {
    const payment = erpRepo.recordPayment({
      invoiceId: req.params.id,
      amount: Number(req.body.amount),
      paymentMode: req.body.paymentMode,
      referenceNumber: req.body.referenceNumber,
      notes: req.body.notes,
    });
    res.status(201).json(payment);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ==========================================
// 6. INVENTORY & PROCUREMENT
// ==========================================

apiRouter.get('/warehouses', (_req: Request, res: Response) => {
  res.json(erpRepo.warehouses);
});

apiRouter.get('/inventory', (_req: Request, res: Response) => {
  res.json(erpRepo.getInventory());
});

apiRouter.get('/inventory/movements', (_req: Request, res: Response) => {
  res.json(erpRepo.getStockMovements());
});

apiRouter.post('/inventory/movements', (req: Request, res: Response) => {
  try {
    const movement = erpRepo.recordStockMovement(req.body);
    res.status(201).json(movement);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/suppliers', (_req: Request, res: Response) => {
  res.json(erpRepo.getSuppliers());
});

apiRouter.get('/purchase-orders', (_req: Request, res: Response) => {
  res.json(erpRepo.getPurchaseOrders());
});

apiRouter.post('/purchase-orders', (req: Request, res: Response) => {
  try {
    const po = erpRepo.createPurchaseOrder(req.body);
    res.status(201).json(po);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/purchase-orders/:id/receive', (req: Request, res: Response) => {
  try {
    const result = erpRepo.receiveGoods(req.params.id, req.body.warehouseId);
    res.json(result);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ==========================================
// 7. HUMAN RESOURCES
// ==========================================

apiRouter.get('/employees', (_req: Request, res: Response) => {
  res.json(erpRepo.getEmployees());
});

apiRouter.get('/leave-requests', (_req: Request, res: Response) => {
  res.json(erpRepo.getLeaveRequests());
});

apiRouter.post('/leave-requests', (req: Request, res: Response) => {
  try {
    const leave = erpRepo.createLeaveRequest(req.body);
    res.status(201).json(leave);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.patch('/leave-requests/:id/status', (req: Request, res: Response) => {
  try {
    const leave = erpRepo.updateLeaveStatus(req.params.id, req.body.status);
    res.json(leave);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ==========================================
// 8. FINANCE & GENERAL LEDGER
// ==========================================

apiRouter.get('/finance/expenses', (_req: Request, res: Response) => {
  res.json(erpRepo.getExpenses());
});

apiRouter.post('/finance/expenses', (req: Request, res: Response) => {
  try {
    const exp = erpRepo.createExpense(req.body);
    res.status(201).json(exp);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.patch('/finance/expenses/:id/status', (req: Request, res: Response) => {
  try {
    const exp = erpRepo.updateExpenseStatus(req.params.id, req.body.status);
    res.json(exp);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/finance/accounts', (_req: Request, res: Response) => {
  res.json(erpRepo.getAccounts());
});

apiRouter.get('/finance/journal-entries', (_req: Request, res: Response) => {
  res.json(erpRepo.getJournalEntries());
});

apiRouter.post('/finance/journal-entries', (req: Request, res: Response) => {
  try {
    const entry = erpRepo.postJournalEntry(req.body);
    res.status(201).json(entry);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ==========================================
// 9. PROJECTS & OPERATIONS
// ==========================================

apiRouter.get('/projects', (_req: Request, res: Response) => {
  res.json(erpRepo.getProjects());
});

apiRouter.get('/tasks', (req: Request, res: Response) => {
  const projectId = req.query.projectId as string | undefined;
  res.json(erpRepo.getTasks(projectId));
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  try {
    const task = erpRepo.createTask(req.body);
    res.status(201).json(task);
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.patch('/tasks/:id/status', (req: Request, res: Response) => {
  const task = erpRepo.updateTaskStatus(req.params.id, req.body.status);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// ==========================================
// 10. SYSTEM AUDIT & NOTIFICATIONS
// ==========================================

apiRouter.get('/audit-logs', (_req: Request, res: Response) => {
  res.json(erpRepo.auditLogs);
});

apiRouter.get('/notifications', (_req: Request, res: Response) => {
  res.json(erpRepo.notifications);
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = erpRepo.notifications.find(n => n.id === req.params.id);
  if (notif) notif.is_read = true;
  res.json({ success: true, notif });
});

apiRouter.get('/company-settings', (_req: Request, res: Response) => {
  res.json(erpRepo.companySettings);
});

apiRouter.get('/departments', (_req: Request, res: Response) => {
  res.json(erpRepo.departments);
});

apiRouter.get('/documents', (_req: Request, res: Response) => {
  res.json(erpRepo.documents);
});
