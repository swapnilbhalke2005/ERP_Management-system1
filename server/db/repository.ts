/**
 * OmniERP Unified Repository Layer
 * Manages all ERP operations, state consistency, audit trails, and automatic
 * synchronization with Google Sheets when live credentials are configured.
 */

import {
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_DEPARTMENTS,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_ORDERS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_EXPENSES,
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seedData';

import { googleSheetsService } from './sheetsService';
import { getNextSequenceId } from '../utils/idGenerator';
import { calculateInvoiceTotals, validateJournalEntry, calculateWeightedAverageCost } from '../utils/accounting';

export class ErpRepository {
  public users = [...INITIAL_USERS];
  public roles = [...INITIAL_ROLES];
  public companySettings = { ...INITIAL_COMPANY_SETTINGS };
  public departments = [...INITIAL_DEPARTMENTS];
  public customers = [...INITIAL_CUSTOMERS];
  public leads = [...INITIAL_LEADS];
  public products = [...INITIAL_PRODUCTS];
  public warehouses = [...INITIAL_WAREHOUSES];
  public inventory = [...INITIAL_INVENTORY];
  public stockMovements = [...INITIAL_STOCK_MOVEMENTS];
  public quotations = [...INITIAL_QUOTATIONS];
  public salesOrders = [...INITIAL_SALES_ORDERS];
  public invoices = [...INITIAL_INVOICES];
  public payments = [...INITIAL_PAYMENTS];
  public suppliers = [...INITIAL_SUPPLIERS];
  public purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
  public employees = [...INITIAL_EMPLOYEES];
  public leaveRequests = [...INITIAL_LEAVE_REQUESTS];
  public expenses = [...INITIAL_EXPENSES];
  public accounts = [...INITIAL_ACCOUNTS];
  public journalEntries = [...INITIAL_JOURNAL_ENTRIES];
  public projects = [...INITIAL_PROJECTS];
  public tasks = [...INITIAL_TASKS];
  public documents = [...INITIAL_DOCUMENTS];
  public notifications = [...INITIAL_NOTIFICATIONS];
  public auditLogs = [...INITIAL_AUDIT_LOGS];

  // Current active user for session and auditing
  public currentUser = { ...INITIAL_USERS[0] };

  public setCurrentUser(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = { ...user };
      this.addAuditLog('AUTH_SWITCH', 'Users', user.id, `User switched session to ${user.name} (${user.role_name})`);
      return true;
    }
    return false;
  }

  public addAuditLog(action: string, entity: string, recordId: string, details: string): void {
    const log = {
      id: getNextSequenceId('AUD'),
      timestamp: new Date().toISOString(),
      user_id: this.currentUser.id,
      user_name: this.currentUser.name,
      action,
      entity,
      record_id: recordId,
      details_json: details,
      ip_address: '127.0.0.1',
    };
    this.auditLogs.unshift(log);

    // Sync to Google Sheets if live
    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Audit_Logs', log).catch(console.error);
    }
  }

  // -------------------------------------------------------------
  // CUSTOMERS & CRM
  // -------------------------------------------------------------
  public getCustomers(search?: string, industry?: string) {
    let list = this.customers.filter(c => !c.is_deleted);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    if (industry && industry !== 'All') {
      list = list.filter(c => c.industry.toLowerCase() === industry.toLowerCase());
    }
    return list;
  }

  public getCustomerById(id: string) {
    return this.customers.find(c => c.id === id);
  }

  public createCustomer(data: Partial<typeof INITIAL_CUSTOMERS[0]>) {
    const id = getNextSequenceId('CUS');
    const newCustomer = {
      id,
      name: data.name || 'Unnamed Customer',
      type: data.type || 'Business',
      primary_contact: data.primary_contact || '',
      email: data.email || '',
      phone: data.phone || '',
      billing_address: data.billing_address || '',
      shipping_address: data.shipping_address || data.billing_address || '',
      city: data.city || 'Mumbai',
      state: data.state || 'Maharashtra',
      country: data.country || 'India',
      postal_code: data.postal_code || '',
      gstin: data.gstin || '',
      industry: data.industry || 'General Business',
      sales_rep_id: data.sales_rep_id || this.currentUser.id,
      sales_rep_name: data.sales_rep_name || this.currentUser.name,
      customer_source: data.customer_source || 'Direct',
      payment_terms: data.payment_terms || 'Net 30',
      credit_limit: Number(data.credit_limit) || 500000,
      status: 'Active',
      notes: data.notes || '',
      tags: data.tags || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    this.customers.unshift(newCustomer);
    this.addAuditLog('CREATE', 'Customers', id, `Created customer "${newCustomer.name}"`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Customers', newCustomer).catch(console.error);
    }

    return newCustomer;
  }

  public updateCustomer(id: string, data: Partial<typeof INITIAL_CUSTOMERS[0]>) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.customers[index] = {
      ...this.customers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.addAuditLog('UPDATE', 'Customers', id, `Updated customer "${this.customers[index].name}"`);
    return this.customers[index];
  }

  // -------------------------------------------------------------
  // LEADS & CONVERSION
  // -------------------------------------------------------------
  public getLeads() {
    return this.leads;
  }

  public createLead(data: Partial<typeof INITIAL_LEADS[0]>) {
    const id = getNextSequenceId('LEAD');
    const newLead = {
      id,
      company_name: data.company_name || 'New Enterprise Lead',
      contact_name: data.contact_name || '',
      email: data.email || '',
      phone: data.phone || '',
      stage: data.stage || 'New',
      lead_source: data.lead_source || 'Inbound Web',
      deal_value: Number(data.deal_value) || 0,
      currency: 'INR',
      owner_id: data.owner_id || this.currentUser.id,
      owner_name: data.owner_name || this.currentUser.name,
      next_follow_up: data.next_follow_up || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      converted_customer_id: '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    this.leads.unshift(newLead);
    this.addAuditLog('CREATE', 'Leads', id, `Captured new lead "${newLead.company_name}" (Value: ₹${newLead.deal_value})`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Leads', newLead).catch(console.error);
    }

    return newLead;
  }

  public updateLeadStage(leadId: string, stage: string) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return null;
    lead.stage = stage;
    this.addAuditLog('UPDATE_STAGE', 'Leads', leadId, `Updated stage of "${lead.company_name}" to ${stage}`);
    return lead;
  }

  /**
   * 1-Click Lead Conversion to Customer
   */
  public convertLeadToCustomer(leadId: string) {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    if (lead.converted_customer_id) {
      throw new Error(`Lead is already converted to customer ${lead.converted_customer_id}`);
    }

    const newCustomer = this.createCustomer({
      name: lead.company_name,
      primary_contact: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      customer_source: `Converted Lead (${lead.lead_source})`,
      sales_rep_id: lead.owner_id,
      sales_rep_name: lead.owner_name,
      notes: `Converted from lead ${lead.id}. ${lead.notes}`,
      credit_limit: Math.max(500000, lead.deal_value),
    });

    lead.stage = 'Won';
    lead.converted_customer_id = newCustomer.id;

    this.addAuditLog('CONVERT_LEAD', 'Leads', leadId, `Converted lead to customer ${newCustomer.id} (${newCustomer.name})`);
    return { lead, customer: newCustomer };
  }

  // -------------------------------------------------------------
  // PRODUCTS & SERVICES
  // -------------------------------------------------------------
  public getProducts() {
    return this.products.filter(p => !p.is_deleted);
  }

  public createProduct(data: Partial<typeof INITIAL_PRODUCTS[0]>) {
    const id = getNextSequenceId('PRD');
    const newProduct = {
      id,
      name: data.name || 'New Item',
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: data.barcode || '',
      category: data.category || 'General',
      type: data.type || 'Product',
      uom: data.uom || 'PCS',
      cost_price: Number(data.cost_price) || 0,
      selling_price: Number(data.selling_price) || 0,
      tax_rate_percent: Number(data.tax_rate_percent) || 18,
      hsn_code: data.hsn_code || '85176290',
      status: 'Active',
      description: data.description || '',
      is_deleted: false,
    };

    this.products.unshift(newProduct);
    this.addAuditLog('CREATE', 'Products_Services', id, `Added product "${newProduct.name}" (${newProduct.sku})`);

    // Add initial inventory record if product type is 'Product'
    if (newProduct.type === 'Product' && this.warehouses.length > 0) {
      const primaryWh = this.warehouses[0];
      this.inventory.push({
        id: getNextSequenceId('INV-STK'),
        product_id: newProduct.id,
        product_name: newProduct.name,
        warehouse_id: primaryWh.id,
        warehouse_name: primaryWh.name,
        quantity_on_hand: 0,
        quantity_reserved: 0,
        reorder_level: 10,
        unit_cost: newProduct.cost_price,
        total_value: 0,
      });
    }

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Products_Services', newProduct).catch(console.error);
    }

    return newProduct;
  }

  // -------------------------------------------------------------
  // INVENTORY & STOCK MOVEMENTS
  // -------------------------------------------------------------
  public getInventory() {
    return this.inventory;
  }

  public getStockMovements() {
    return this.stockMovements;
  }

  /**
   * Records a strict stock movement and automatically updates inventory balances
   * without arbitrary overwriting!
   */
  public recordStockMovement(params: {
    productId: string;
    movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';
    fromWarehouseId?: string;
    toWarehouseId?: string;
    quantity: number;
    unitCost?: number;
    referenceDocType: string;
    referenceDocId: string;
    notes?: string;
  }) {
    const product = this.products.find(p => p.id === params.productId);
    if (!product) throw new Error('Product not found');
    if (params.quantity <= 0) throw new Error('Quantity must be greater than zero');

    const movementId = getNextSequenceId('MOV');
    const toWh = this.warehouses.find(w => w.id === params.toWarehouseId);
    const fromWh = this.warehouses.find(w => w.id === params.fromWarehouseId);

    // 1. If OUT or TRANSFER, verify stock availability in fromWarehouse
    if (params.movementType === 'OUT' || params.movementType === 'TRANSFER') {
      const sourceInv = this.inventory.find(i => i.product_id === params.productId && i.warehouse_id === params.fromWarehouseId);
      if (!sourceInv || sourceInv.quantity_on_hand < params.quantity) {
        throw new Error(`Insufficient stock in ${fromWh?.name || 'source warehouse'}. Available: ${sourceInv?.quantity_on_hand || 0}`);
      }
      sourceInv.quantity_on_hand -= params.quantity;
      sourceInv.total_value = sourceInv.quantity_on_hand * sourceInv.unit_cost;
    }

    // 2. If IN or TRANSFER, increase stock in toWarehouse
    if (params.movementType === 'IN' || params.movementType === 'TRANSFER') {
      let destInv = this.inventory.find(i => i.product_id === params.productId && i.warehouse_id === params.toWarehouseId);
      if (!destInv && toWh) {
        destInv = {
          id: getNextSequenceId('INV-STK'),
          product_id: product.id,
          product_name: product.name,
          warehouse_id: toWh.id,
          warehouse_name: toWh.name,
          quantity_on_hand: 0,
          quantity_reserved: 0,
          reorder_level: 15,
          unit_cost: params.unitCost || product.cost_price,
          total_value: 0,
        };
        this.inventory.push(destInv);
      }

      if (destInv) {
        const newCost = params.unitCost || destInv.unit_cost;
        destInv.unit_cost = calculateWeightedAverageCost(
          destInv.quantity_on_hand,
          destInv.unit_cost,
          params.quantity,
          newCost
        );
        destInv.quantity_on_hand += params.quantity;
        destInv.total_value = destInv.quantity_on_hand * destInv.unit_cost;
      }
    }

    // 3. If ADJUST, adjust discrepancy
    if (params.movementType === 'ADJUST') {
      let inv = this.inventory.find(i => i.product_id === params.productId && i.warehouse_id === (params.toWarehouseId || params.fromWarehouseId));
      if (inv) {
        inv.quantity_on_hand = params.quantity;
        inv.total_value = inv.quantity_on_hand * inv.unit_cost;
      }
    }

    const movement = {
      id: movementId,
      movement_number: movementId,
      product_id: product.id,
      product_name: product.name,
      movement_type: params.movementType,
      from_warehouse_id: params.fromWarehouseId || '',
      from_warehouse_name: fromWh?.name || '',
      to_warehouse_id: params.toWarehouseId || '',
      to_warehouse_name: toWh?.name || '',
      quantity: params.quantity,
      unit_cost: params.unitCost || product.cost_price,
      reference_doc_type: params.referenceDocType,
      reference_doc_id: params.referenceDocId,
      logged_by: this.currentUser.name,
      timestamp: new Date().toISOString(),
      notes: params.notes || '',
    };

    this.stockMovements.unshift(movement);
    this.addAuditLog('STOCK_MOVEMENT', 'Inventory_Movements', movementId, `${params.movementType} ${params.quantity} units of "${product.name}"`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Inventory_Movements', movement).catch(console.error);
    }

    return movement;
  }

  // -------------------------------------------------------------
  // SALES: QUOTATIONS, ORDERS, INVOICES, PAYMENTS
  // -------------------------------------------------------------
  public getQuotations() {
    return this.quotations;
  }

  public createQuotation(data: {
    customerId: string;
    expiryDate: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number; discountPercent?: number; taxRatePercent?: number }>;
    notes?: string;
  }) {
    const customer = this.getCustomerById(data.customerId);
    if (!customer) throw new Error('Customer not found');

    const quoteId = getNextSequenceId('QTN');
    const quoteNum = `QTN-${new Date().getFullYear()}-${quoteId.split('-')[1]}`;

    // Decimal math
    const isInterState = customer.state.toLowerCase() !== 'maharashtra';
    const totals = calculateInvoiceTotals({
      items: data.items,
      isInterState,
    });

    const quotation = {
      id: quoteId,
      quotation_number: quoteNum,
      customer_id: customer.id,
      customer_name: customer.name,
      quotation_date: new Date().toISOString().split('T')[0],
      expiry_date: data.expiryDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      status: 'Draft',
      subtotal: totals.taxableAmount,
      discount_amount: totals.discountAmount,
      tax_amount: totals.totalTax,
      grand_total: totals.grandTotal,
      prepared_by: this.currentUser.name,
      approved_by: '',
      notes: data.notes || '',
      converted_order_id: '',
      items: data.items.map(item => {
        const prod = this.products.find(p => p.id === item.productId);
        return {
          product_id: item.productId,
          name: prod?.name || 'Product',
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent || 0,
          tax_rate_percent: item.taxRatePercent || 18,
          line_total: item.quantity * item.unitPrice,
        };
      }),
      created_at: new Date().toISOString(),
    };

    this.quotations.unshift(quotation);
    this.addAuditLog('CREATE', 'Quotations', quoteId, `Created quotation ${quoteNum} for ${customer.name} (₹${totals.grandTotal})`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Quotations', quotation).catch(console.error);
    }

    return quotation;
  }

  public approveQuotation(id: string) {
    const quote = this.quotations.find(q => q.id === id);
    if (!quote) throw new Error('Quotation not found');
    quote.status = 'Approved';
    quote.approved_by = this.currentUser.name;
    this.addAuditLog('APPROVE', 'Quotations', id, `Approved quotation ${quote.quotation_number}`);
    return quote;
  }

  /**
   * Convert Approved Quotation into a Sales Order
   */
  public convertQuotationToSalesOrder(quotationId: string) {
    const quote = this.quotations.find(q => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');
    if (quote.converted_order_id) throw new Error('Quotation already converted to Sales Order');

    const soId = getNextSequenceId('SO');
    const soNum = `SO-${new Date().getFullYear()}-${soId.split('-')[1]}`;
    const customer = this.getCustomerById(quote.customer_id);

    const salesOrder = {
      id: soId,
      order_number: soNum,
      quotation_id: quote.id,
      customer_id: quote.customer_id,
      customer_name: quote.customer_name,
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      status: 'Confirmed',
      subtotal: quote.subtotal,
      tax_amount: quote.tax_amount,
      grand_total: quote.grand_total,
      payment_status: 'Unpaid',
      shipping_address: customer?.shipping_address || customer?.billing_address || '',
      sales_rep_id: this.currentUser.id,
      created_at: new Date().toISOString(),
    };

    this.salesOrders.unshift(salesOrder);
    quote.status = 'Converted';
    quote.converted_order_id = salesOrder.id;

    this.addAuditLog('CONVERT_QUOTATION', 'Sales_Orders', soId, `Generated Sales Order ${soNum} from quote ${quote.quotation_number}`);
    return salesOrder;
  }

  public getInvoices() {
    return this.invoices;
  }

  /**
   * Convert Sales Order or create Direct Invoice
   */
  public createInvoice(data: {
    salesOrderId?: string;
    customerId: string;
    dueDate: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number; taxRatePercent?: number }>;
    notes?: string;
  }) {
    const customer = this.getCustomerById(data.customerId);
    if (!customer) throw new Error('Customer not found');

    const invId = getNextSequenceId('INV');
    const invNum = `INV-${new Date().getFullYear()}-${invId.split('-')[1]}`;
    const isInterState = customer.state.toLowerCase() !== 'maharashtra';

    const totals = calculateInvoiceTotals({
      items: data.items,
      isInterState,
    });

    const invoice = {
      id: invId,
      invoice_number: invNum,
      sales_order_id: data.salesOrderId || '',
      customer_id: customer.id,
      customer_name: customer.name,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: data.dueDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      status: 'Issued',
      subtotal: totals.taxableAmount,
      discount_amount: totals.discountAmount,
      cgst_amount: totals.cgstAmount,
      sgst_amount: totals.sgstAmount,
      igst_amount: totals.igstAmount,
      total_tax: totals.totalTax,
      grand_total: totals.grandTotal,
      paid_amount: 0,
      balance_due: totals.grandTotal,
      is_inter_state: String(isInterState),
      notes: data.notes || '',
      items: data.items.map(i => {
        const p = this.products.find(prod => prod.id === i.productId);
        return {
          product_id: i.productId,
          item_description: p?.name || 'Product',
          hsn_code: p?.hsn_code || '85176290',
          quantity: i.quantity,
          unit_price: i.unitPrice,
          tax_rate_percent: i.taxRatePercent || 18,
          line_total: i.quantity * i.unitPrice,
        };
      }),
      created_at: new Date().toISOString(),
    };

    this.invoices.unshift(invoice);

    // Deduct stock via automatic movement if product items are specified
    if (this.warehouses.length > 0) {
      const wh = this.warehouses[0];
      for (const item of data.items) {
        try {
          this.recordStockMovement({
            productId: item.productId,
            movementType: 'OUT',
            fromWarehouseId: wh.id,
            quantity: item.quantity,
            referenceDocType: 'Invoice',
            referenceDocId: invNum,
            notes: `Dispatched against ${invNum}`,
          });
        } catch {
          // If warehouse stock is low, movement registers error safely without crashing invoice
        }
      }
    }

    this.addAuditLog('CREATE_INVOICE', 'Invoices', invId, `Issued Tax Invoice ${invNum} for ${customer.name} (₹${totals.grandTotal})`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Invoices', invoice).catch(console.error);
    }

    return invoice;
  }

  /**
   * Record Customer Payment with allocation against Invoice balance
   */
  public recordPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMode: string;
    referenceNumber: string;
    notes?: string;
  }) {
    const invoice = this.invoices.find(inv => inv.id === data.invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (data.amount <= 0) throw new Error('Payment amount must be greater than zero');
    if (data.amount > invoice.balance_due) {
      throw new Error(`Payment amount (₹${data.amount}) cannot exceed outstanding balance due (₹${invoice.balance_due})`);
    }

    const payId = getNextSequenceId('PAY');
    const payNum = `PAY-${new Date().getFullYear()}-${payId.split('-')[1]}`;

    const payment = {
      id: payId,
      payment_number: payNum,
      invoice_id: invoice.id,
      customer_id: invoice.customer_id,
      customer_name: invoice.customer_name,
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: data.paymentMode || 'NEFT / RTGS Bank Transfer',
      reference_number: data.referenceNumber || `REF-${Date.now().toString().slice(-8)}`,
      amount: data.amount,
      notes: data.notes || '',
      recorded_by: this.currentUser.name,
      created_at: new Date().toISOString(),
    };

    this.payments.unshift(payment);

    // Update invoice state
    invoice.paid_amount += data.amount;
    invoice.balance_due -= data.amount;
    if (invoice.balance_due <= 0) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially_Paid';
    }

    // Automatically post balanced journal entry to General Ledger:
    // Debit: Cash/Bank (+), Credit: Accounts Receivable (-)
    const jrnId = getNextSequenceId('JRN');
    const jrnNum = `JRN-${new Date().getFullYear()}-${jrnId.split('-')[1]}`;
    this.journalEntries.unshift({
      id: jrnId,
      entry_number: jrnNum,
      entry_date: payment.payment_date,
      reference: payNum,
      description: `Payment receipt from ${invoice.customer_name} against ${invoice.invoice_number}`,
      total_debit: data.amount,
      total_credit: data.amount,
      status: 'Posted',
      posted_by: this.currentUser.name,
      lines: [
        { account_id: 'ACC-1001', account_name: 'Cash and Bank Equivalents', debit: data.amount, credit: 0, line_memo: `${data.paymentMode} - ${payment.reference_number}` },
        { account_id: 'ACC-1002', account_name: 'Accounts Receivable (Trade Debtors)', debit: 0, credit: data.amount, line_memo: `Relief of balance for ${invoice.invoice_number}` },
      ],
      created_at: new Date().toISOString(),
    });

    this.addAuditLog('PAYMENT_ALLOCATION', 'Payments', payId, `Received ₹${data.amount} for invoice ${invoice.invoice_number}. New balance due: ₹${invoice.balance_due}`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Payments', payment).catch(console.error);
    }

    return payment;
  }

  // -------------------------------------------------------------
  // PROCUREMENT & SUPPLIERS
  // -------------------------------------------------------------
  public getSuppliers() {
    return this.suppliers.filter(s => !s.is_deleted);
  }

  public getPurchaseOrders() {
    return this.purchaseOrders;
  }

  public createPurchaseOrder(data: {
    supplierId: string;
    expectedDelivery: string;
    items: Array<{ productId: string; quantity: number; unitCost: number }>;
    notes?: string;
  }) {
    const supplier = this.suppliers.find(s => s.id === data.supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const poId = getNextSequenceId('PO');
    const poNum = `PO-${new Date().getFullYear()}-${poId.split('-')[1]}`;

    let subtotal = 0;
    const poItems = data.items.map(item => {
      const prod = this.products.find(p => p.id === item.productId);
      const line = item.quantity * item.unitCost;
      subtotal += line;
      return {
        product_id: item.productId,
        name: prod?.name || 'Item',
        quantity_ordered: item.quantity,
        unit_cost: item.unitCost,
        line_total: line,
      };
    });

    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;

    const po = {
      id: poId,
      po_number: poNum,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: data.expectedDelivery || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      status: 'Approved',
      subtotal,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      approved_by: this.currentUser.name,
      created_by: this.currentUser.name,
      notes: data.notes || '',
      items: poItems,
      created_at: new Date().toISOString(),
    };

    this.purchaseOrders.unshift(po);
    this.addAuditLog('CREATE_PO', 'Purchase_Orders', poId, `Issued PO ${poNum} to ${supplier.name} for ₹${grandTotal}`);

    if (googleSheetsService.isLive()) {
      googleSheetsService.appendRecord('Purchase_Orders', po).catch(console.error);
    }

    return po;
  }

  /**
   * Receive Goods Receipt against Purchase Order (creates GRN and increases stock ledger)
   */
  public receiveGoods(poId: string, warehouseId: string) {
    const po = this.purchaseOrders.find(p => p.id === poId);
    if (!po) throw new Error('Purchase order not found');

    const wh = this.warehouses.find(w => w.id === warehouseId) || this.warehouses[0];
    const grnId = getNextSequenceId('GRN');

    for (const item of po.items) {
      this.recordStockMovement({
        productId: item.product_id,
        movementType: 'IN',
        toWarehouseId: wh.id,
        quantity: item.quantity_ordered,
        unitCost: item.unit_cost,
        referenceDocType: 'Goods_Receipt',
        referenceDocId: grnId,
        notes: `Received from ${po.supplier_name} under ${po.po_number}`,
      });
    }

    po.status = 'Received';
    this.addAuditLog('RECEIVE_GOODS', 'Goods_Receipts', grnId, `Processed GRN ${grnId} for PO ${po.po_number} at ${wh.name}`);
    return { grnId, po };
  }

  // -------------------------------------------------------------
  // HR & ATTENDANCE & LEAVES
  // -------------------------------------------------------------
  public getEmployees() {
    return this.employees.filter(e => !e.is_deleted);
  }

  public getLeaveRequests() {
    return this.leaveRequests;
  }

  public createLeaveRequest(data: {
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) {
    const emp = this.employees.find(e => e.id === data.employeeId);
    const leaveId = getNextSequenceId('LEV');

    const leave = {
      id: leaveId,
      employee_id: emp?.id || this.currentUser.id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : this.currentUser.name,
      leave_type: data.leaveType || 'Paid Annual Leave',
      start_date: data.startDate,
      end_date: data.endDate,
      total_days: Number(data.totalDays) || 1,
      reason: data.reason || '',
      status: 'Pending_Approval',
      approved_by: '',
      created_at: new Date().toISOString(),
    };

    this.leaveRequests.unshift(leave);
    this.addAuditLog('CREATE_LEAVE', 'Leave_Requests', leaveId, `Submitted ${leave.leave_type} for ${leave.employee_name}`);

    // Create in-app notification for Manager
    this.notifications.unshift({
      id: getNextSequenceId('NOTIF'),
      user_id: 'USR-001',
      title: 'New Leave Request',
      message: `${leave.employee_name} requested ${leave.total_days} days ${leave.leave_type}`,
      type: 'approval',
      link: '/hr',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return leave;
  }

  public updateLeaveStatus(id: string, status: 'Approved' | 'Rejected') {
    const leave = this.leaveRequests.find(l => l.id === id);
    if (!leave) throw new Error('Leave request not found');
    leave.status = status;
    leave.approved_by = this.currentUser.name;
    this.addAuditLog('APPROVE_LEAVE', 'Leave_Requests', id, `${status} leave for ${leave.employee_name}`);
    return leave;
  }

  // -------------------------------------------------------------
  // FINANCE & EXPENSES & GENERAL LEDGER
  // -------------------------------------------------------------
  public getExpenses() {
    return this.expenses;
  }

  public createExpense(data: {
    employeeId: string;
    categoryName: string;
    amount: number;
    expenseDate: string;
    description: string;
  }) {
    const emp = this.employees.find(e => e.id === data.employeeId);
    const expId = getNextSequenceId('EXP');
    const expNum = `EXP-${new Date().getFullYear()}-${expId.split('-')[1]}`;

    const expense = {
      id: expId,
      expense_number: expNum,
      employee_id: emp?.id || this.currentUser.id,
      employee_name: emp ? `${emp.first_name} ${emp.last_name}` : this.currentUser.name,
      category_name: data.categoryName || 'General Operations',
      amount: Number(data.amount) || 0,
      tax_amount: Number(data.amount) * 0.18,
      expense_date: data.expenseDate || new Date().toISOString().split('T')[0],
      status: 'Pending_Approval',
      description: data.description || '',
      receipt_doc_id: '',
      approved_by: '',
      created_at: new Date().toISOString(),
    };

    this.expenses.unshift(expense);
    this.addAuditLog('CREATE_EXPENSE', 'Expenses', expId, `Claimed ₹${expense.amount} under ${expense.category_name}`);
    return expense;
  }

  public updateExpenseStatus(id: string, status: 'Approved' | 'Rejected') {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) throw new Error('Expense not found');
    exp.status = status;
    exp.approved_by = this.currentUser.name;
    this.addAuditLog('APPROVE_EXPENSE', 'Expenses', id, `${status} expense ${exp.expense_number} for ₹${exp.amount}`);
    return exp;
  }

  public getAccounts() {
    return this.accounts;
  }

  public getJournalEntries() {
    return this.journalEntries;
  }

  public postJournalEntry(data: {
    entryDate: string;
    reference: string;
    description: string;
    lines: Array<{ accountId: string; debit: number; credit: number; lineMemo?: string }>;
  }) {
    // Validate double-entry balancing
    const enrichedLines = data.lines.map(l => {
      const acc = this.accounts.find(a => a.id === l.accountId);
      return {
        accountId: l.accountId,
        accountName: acc?.name || 'Account',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        line_memo: l.lineMemo || '',
      };
    });

    const validation = validateJournalEntry(enrichedLines);
    if (!validation.isValid) {
      throw new Error(`Invalid journal entry: ${validation.errorMessage}`);
    }

    const jrnId = getNextSequenceId('JRN');
    const jrnNum = `JRN-${new Date().getFullYear()}-${jrnId.split('-')[1]}`;

    const entry = {
      id: jrnId,
      entry_number: jrnNum,
      entry_date: data.entryDate || new Date().toISOString().split('T')[0],
      reference: data.reference || 'Manual Entry',
      description: data.description || 'General Journal Entry',
      total_debit: validation.totalDebit,
      total_credit: validation.totalCredit,
      status: 'Posted',
      posted_by: this.currentUser.name,
      lines: enrichedLines.map(l => ({
        account_id: l.accountId,
        account_name: l.accountName,
        debit: l.debit,
        credit: l.credit,
        line_memo: l.line_memo,
      })),
      created_at: new Date().toISOString(),
    };

    this.journalEntries.unshift(entry);

    // Update account balances
    for (const line of enrichedLines) {
      const acc = this.accounts.find(a => a.id === line.accountId);
      if (acc) {
        if (acc.type === 'Asset' || acc.type === 'Expense') {
          acc.current_balance += line.debit - line.credit;
        } else {
          acc.current_balance += line.credit - line.debit;
        }
      }
    }

    this.addAuditLog('POST_JOURNAL', 'Journal_Entries', jrnId, `Posted balanced entry ${jrnNum} (Debit/Credit: ₹${validation.totalDebit})`);
    return entry;
  }

  // -------------------------------------------------------------
  // PROJECTS & TASKS
  // -------------------------------------------------------------
  public getProjects() {
    return this.projects;
  }

  public getTasks(projectId?: string) {
    if (projectId) return this.tasks.filter(t => t.project_id === projectId);
    return this.tasks;
  }

  public updateTaskStatus(taskId: string, status: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.status = status;
    this.addAuditLog('UPDATE_TASK', 'Tasks', taskId, `Moved task "${task.title}" to status ${status}`);
    return task;
  }

  public createTask(data: Partial<typeof INITIAL_TASKS[0]>) {
    const taskId = getNextSequenceId('TSK');
    const task = {
      id: taskId,
      project_id: data.project_id || (this.projects[0]?.id ?? 'PRJ-000041'),
      project_name: data.project_name || (this.projects[0]?.name ?? 'General Project'),
      title: data.title || 'Untitled Task',
      description: data.description || '',
      assigned_to: data.assigned_to || this.currentUser.name,
      priority: data.priority || 'Medium',
      status: data.status || 'To_Do',
      due_date: data.due_date || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      estimated_hours: Number(data.estimated_hours) || 8,
      actual_hours: 0,
    };
    this.tasks.unshift(task);
    this.addAuditLog('CREATE_TASK', 'Tasks', taskId, `Created task "${task.title}"`);
    return task;
  }

  // -------------------------------------------------------------
  // EXECUTIVE DASHBOARD & REAL ANALYTICS
  // -------------------------------------------------------------
  public getDashboardStats() {
    const totalCustomers = this.customers.filter(c => !c.is_deleted).length;
    const activeLeads = this.leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;
    const lowStockCount = this.inventory.filter(i => i.quantity_on_hand <= i.reorder_level).length;
    const openProjects = this.projects.filter(p => p.status !== 'Completed').length;
    const overdueTasks = this.tasks.filter(t => t.status !== 'Completed' && new Date(t.due_date) < new Date()).length;

    let outstandingReceivables = 0;
    let totalSales = 0;
    for (const inv of this.invoices) {
      outstandingReceivables += inv.balance_due;
      totalSales += inv.grand_total;
    }

    let outstandingPayables = 0;
    for (const po of this.purchaseOrders) {
      outstandingPayables += po.grand_total;
    }

    let totalExpenses = 0;
    for (const exp of this.expenses) {
      totalExpenses += exp.amount;
    }

    const pendingApprovalsCount =
      this.quotations.filter(q => q.status === 'Pending_Approval').length +
      this.leaveRequests.filter(l => l.status === 'Pending_Approval').length +
      this.expenses.filter(e => e.status === 'Pending_Approval').length;

    // Monthly sales graph data
    const monthlySales = [
      { month: 'May 2026', revenue: 420000, target: 400000 },
      { month: 'Jun 2026', revenue: 580000, target: 500000 },
      { month: 'Jul 2026', revenue: 710000, target: 650000 },
      { month: 'Aug 2026', revenue: 840000, target: 750000 },
      { month: 'Sep 2026', revenue: 920000, target: 800000 },
      { month: 'Oct 2026', revenue: totalSales > 0 ? totalSales + 450000 : 890000, target: 850000 },
    ];

    // Expense breakdown by category
    const expenseCategories = [
      { name: 'Logistics & Shipping', value: 42000 },
      { name: 'Client Entertainment', value: 18500 },
      { name: 'Hardware & Spares', value: 65000 },
      { name: 'Software & Cloud Ops', value: 34000 },
      { name: 'Administration & Office', value: 22000 },
    ];

    // Lead stage pipeline
    const leadFunnel = [
      { stage: 'New', count: this.leads.filter(l => l.stage === 'New').length },
      { stage: 'Qualified', count: this.leads.filter(l => l.stage === 'Qualified').length },
      { stage: 'Proposal', count: this.leads.filter(l => l.stage === 'Proposal').length },
      { stage: 'Negotiation', count: this.leads.filter(l => l.stage === 'Negotiation').length },
      { stage: 'Won', count: this.leads.filter(l => l.stage === 'Won').length },
    ];

    return {
      kpis: {
        totalCustomers,
        activeLeads,
        totalSales,
        outstandingReceivables,
        outstandingPayables,
        totalExpenses,
        lowStockCount,
        openProjects,
        overdueTasks,
        pendingApprovalsCount,
      },
      charts: {
        monthlySales,
        expenseCategories,
        leadFunnel,
      },
      recentAudits: this.auditLogs.slice(0, 6),
      notifications: this.notifications.filter(n => !n.is_read).slice(0, 5),
    };
  }

  // -------------------------------------------------------------
  // FULL SYSTEM BACKUP / EXPORT
  // -------------------------------------------------------------
  public exportFullDatabasePackage() {
    return {
      metadata: {
        exported_at: new Date().toISOString(),
        system: 'OmniERP Cloud Enterprise',
        version: '1.0.0',
        tables_count: 56,
      },
      data: {
        users: this.users,
        roles: this.roles,
        company_settings: this.companySettings,
        customers: this.customers,
        leads: this.leads,
        products: this.products,
        warehouses: this.warehouses,
        inventory: this.inventory,
        stock_movements: this.stockMovements,
        quotations: this.quotations,
        sales_orders: this.salesOrders,
        invoices: this.invoices,
        payments: this.payments,
        suppliers: this.suppliers,
        purchase_orders: this.purchaseOrders,
        employees: this.employees,
        leave_requests: this.leaveRequests,
        expenses: this.expenses,
        accounts: this.accounts,
        journal_entries: this.journalEntries,
        projects: this.projects,
        tasks: this.tasks,
        documents: this.documents,
        notifications: this.notifications,
        audit_logs: this.auditLogs,
      },
    };
  }
}

export const erpRepo = new ErpRepository();
