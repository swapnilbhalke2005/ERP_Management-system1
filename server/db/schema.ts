/**
 * OmniERP Google Sheets Database Schema
 * Defines the 56 required worksheets, their column headers, primary keys, and descriptions.
 */

export interface WorksheetDefinition {
  name: string;
  category: 'Core' | 'CRM' | 'Sales' | 'Inventory & Procurement' | 'Human Resources' | 'Finance & Expenses' | 'Projects & Operations';
  primaryKey: string;
  columns: string[];
  description: string;
}

export const ERP_WORKSHEETS: WorksheetDefinition[] = [
  // Core worksheets (1-10)
  {
    name: 'Users',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'email', 'name', 'role_id', 'department_id', 'status', 'avatar_url', 'last_login', 'created_at', 'updated_at', 'is_deleted'],
    description: 'System user accounts and access state'
  },
  {
    name: 'Roles',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'name', 'description', 'is_system', 'created_at', 'updated_at'],
    description: 'Access roles (Super Admin, Sales Manager, HR, Finance, etc.)'
  },
  {
    name: 'Permissions',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'role_id', 'module', 'action', 'permitted', 'created_at'],
    description: 'Granular role action permissions matrix'
  },
  {
    name: 'Company_Settings',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'company_name', 'legal_name', 'tax_id_gstin', 'currency', 'fiscal_year_start', 'fiscal_year_end', 'address', 'city', 'country', 'phone', 'email', 'website', 'logo_url', 'updated_at'],
    description: 'Single company master configuration and tax profiles'
  },
  {
    name: 'Departments',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'name', 'code', 'manager_id', 'budget', 'created_at', 'updated_at', 'status'],
    description: 'Corporate organizational departments'
  },
  {
    name: 'Audit_Logs',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'timestamp', 'user_id', 'user_name', 'action', 'entity', 'record_id', 'details_json', 'ip_address'],
    description: 'Immutable system-wide change and security audit trail'
  },
  {
    name: 'Sequence_Counters',
    category: 'Core',
    primaryKey: 'prefix',
    columns: ['prefix', 'last_number', 'padding', 'updated_at'],
    description: 'Atomic counters for invoice, order, and employee ID generation'
  },
  {
    name: 'Notifications',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'user_id', 'title', 'message', 'type', 'link', 'is_read', 'created_at'],
    description: 'In-app user alerts, approvals, and reminders'
  },
  {
    name: 'Attachments',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'record_type', 'record_id', 'file_name', 'file_size', 'mime_type', 'storage_service', 'storage_file_id', 'uploaded_by', 'created_at'],
    description: 'External Drive and cloud storage file metadata references'
  },
  {
    name: 'Import_Export_Logs',
    category: 'Core',
    primaryKey: 'id',
    columns: ['id', 'operation', 'module', 'row_count', 'status', 'user_id', 'created_at', 'details'],
    description: 'CSV bulk data exchange execution logs'
  },

  // CRM (11-16)
  {
    name: 'Customers',
    category: 'CRM',
    primaryKey: 'id',
    columns: ['id', 'name', 'type', 'primary_contact', 'email', 'phone', 'billing_address', 'shipping_address', 'city', 'state', 'country', 'postal_code', 'gstin', 'industry', 'sales_rep_id', 'customer_source', 'payment_terms', 'credit_limit', 'status', 'notes', 'tags', 'created_at', 'updated_at', 'is_deleted'],
    description: 'Customer directory and business profiles'
  },
  {
    name: 'Customer_Contacts',
    category: 'CRM',
    primaryKey: 'id',
    columns: ['id', 'customer_id', 'first_name', 'last_name', 'designation', 'email', 'phone', 'is_primary', 'created_at'],
    description: 'Individual stakeholder contacts within accounts'
  },
  {
    name: 'Leads',
    category: 'CRM',
    primaryKey: 'id',
    columns: ['id', 'company_name', 'contact_name', 'email', 'phone', 'stage', 'lead_source', 'deal_value', 'currency', 'owner_id', 'next_follow_up', 'converted_customer_id', 'created_at', 'updated_at', 'notes'],
    description: 'Sales leads and deal pipeline tracking'
  },
  {
    name: 'Lead_Activities',
    category: 'CRM',
    primaryKey: 'id',
    columns: ['id', 'lead_id', 'activity_type', 'summary', 'details', 'conducted_by', 'activity_date', 'created_at'],
    description: 'Calls, demos, emails, and meetings with leads'
  },
  {
    name: 'Follow_Ups',
    category: 'CRM',
    primaryKey: 'id',
    columns: ['id', 'related_type', 'related_id', 'due_date', 'priority', 'assigned_to', 'status', 'notes', 'created_at'],
    description: 'Actionable reminders for sales and account executives'
  },
  {
    name: 'Customer_Interactions',
    category: 'CRM',
    primaryKey: 'id',
    columns: ['id', 'customer_id', 'channel', 'subject', 'notes', 'logged_by', 'timestamp'],
    description: 'Ongoing relationship and communication records'
  },

  // Sales (17-26)
  {
    name: 'Products_Services',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'name', 'sku', 'barcode', 'category', 'type', 'uom', 'cost_price', 'selling_price', 'tax_rate_percent', 'hsn_code', 'status', 'description', 'created_at', 'updated_at', 'is_deleted'],
    description: 'Catalog of salable goods and professional services'
  },
  {
    name: 'Price_Lists',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'name', 'currency', 'is_active', 'discount_percent', 'valid_from', 'valid_to', 'created_at'],
    description: 'Tiered wholesale, retail, and custom customer pricing'
  },
  {
    name: 'Quotations',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'quotation_number', 'customer_id', 'customer_name', 'quotation_date', 'expiry_date', 'status', 'subtotal', 'discount_amount', 'tax_amount', 'grand_total', 'prepared_by', 'approved_by', 'notes', 'converted_order_id', 'created_at', 'updated_at'],
    description: 'Sales quotes and proposals with validity dates'
  },
  {
    name: 'Quotation_Items',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'quotation_id', 'product_id', 'item_description', 'quantity', 'unit_price', 'discount_percent', 'tax_rate_percent', 'line_total'],
    description: 'Line items within quotations'
  },
  {
    name: 'Sales_Orders',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'order_number', 'quotation_id', 'customer_id', 'customer_name', 'order_date', 'delivery_date', 'status', 'subtotal', 'tax_amount', 'grand_total', 'payment_status', 'shipping_address', 'sales_rep_id', 'created_at', 'updated_at'],
    description: 'Confirmed client purchase contracts'
  },
  {
    name: 'Sales_Order_Items',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'sales_order_id', 'product_id', 'quantity', 'unit_price', 'tax_rate_percent', 'line_total'],
    description: 'Line items within sales orders'
  },
  {
    name: 'Invoices',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'invoice_number', 'sales_order_id', 'customer_id', 'customer_name', 'invoice_date', 'due_date', 'status', 'subtotal', 'discount_amount', 'cgst_amount', 'sgst_amount', 'igst_amount', 'total_tax', 'grand_total', 'paid_amount', 'balance_due', 'is_inter_state', 'notes', 'created_at', 'updated_at'],
    description: 'Official tax invoices with GST breakdowns and balances'
  },
  {
    name: 'Invoice_Items',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'invoice_id', 'product_id', 'item_description', 'hsn_code', 'quantity', 'unit_price', 'tax_rate_percent', 'line_total'],
    description: 'Detailed lines on issued customer invoices'
  },
  {
    name: 'Payments',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'payment_number', 'invoice_id', 'customer_id', 'payment_date', 'payment_mode', 'reference_number', 'amount', 'notes', 'recorded_by', 'created_at'],
    description: 'Customer payment receipts and bank allocations'
  },
  {
    name: 'Credit_Notes',
    category: 'Sales',
    primaryKey: 'id',
    columns: ['id', 'credit_note_number', 'invoice_id', 'customer_id', 'issue_date', 'amount', 'reason', 'status', 'created_at'],
    description: 'Customer returns, discounts, or invoice adjustments'
  },

  // Inventory and Procurement (27-36)
  {
    name: 'Warehouses',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'code', 'name', 'location', 'manager_id', 'is_active', 'created_at'],
    description: 'Physical storage sites, depots, and distribution hubs'
  },
  {
    name: 'Inventory',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'product_id', 'warehouse_id', 'quantity_on_hand', 'quantity_reserved', 'reorder_level', 'unit_cost', 'total_value', 'updated_at'],
    description: 'Current real-time stock balances per location'
  },
  {
    name: 'Inventory_Movements',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'movement_number', 'product_id', 'movement_type', 'from_warehouse_id', 'to_warehouse_id', 'quantity', 'unit_cost', 'reference_doc_type', 'reference_doc_id', 'logged_by', 'timestamp', 'notes'],
    description: 'Strict immutable movement ledger (IN, OUT, TRANSFER, ADJUST)'
  },
  {
    name: 'Stock_Adjustments',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'adjustment_number', 'product_id', 'warehouse_id', 'previous_qty', 'adjusted_qty', 'difference_qty', 'reason', 'approved_by', 'created_at'],
    description: 'Physical stock reconciliation discrepancies'
  },
  {
    name: 'Suppliers',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'gstin', 'payment_terms', 'credit_limit', 'rating', 'status', 'created_at', 'updated_at', 'is_deleted'],
    description: 'Vendor profiles, terms, and purchase histories'
  },
  {
    name: 'Purchase_Orders',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'po_number', 'supplier_id', 'supplier_name', 'order_date', 'expected_delivery', 'status', 'subtotal', 'tax_amount', 'grand_total', 'approved_by', 'created_by', 'notes', 'created_at', 'updated_at'],
    description: 'Outbound purchase orders issued to suppliers'
  },
  {
    name: 'Purchase_Order_Items',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'purchase_order_id', 'product_id', 'quantity_ordered', 'quantity_received', 'unit_cost', 'tax_rate_percent', 'line_total'],
    description: 'Products and quantities requested on purchase orders'
  },
  {
    name: 'Goods_Receipts',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'grn_number', 'purchase_order_id', 'supplier_id', 'warehouse_id', 'received_date', 'received_by', 'remarks', 'created_at'],
    description: 'Physical warehouse receipt confirmation (GRN)'
  },
  {
    name: 'Supplier_Bills',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'bill_number', 'purchase_order_id', 'supplier_id', 'supplier_invoice_ref', 'bill_date', 'due_date', 'amount', 'tax_amount', 'grand_total', 'paid_amount', 'status', 'created_at'],
    description: 'Accounts payable vendor invoices'
  },
  {
    name: 'Supplier_Payments',
    category: 'Inventory & Procurement',
    primaryKey: 'id',
    columns: ['id', 'payment_number', 'bill_id', 'supplier_id', 'payment_date', 'payment_mode', 'reference_number', 'amount', 'recorded_by', 'created_at'],
    description: 'Payments disbursed to suppliers'
  },

  // Human Resources (37-42)
  {
    name: 'Employees',
    category: 'Human Resources',
    primaryKey: 'id',
    columns: ['id', 'employee_code', 'first_name', 'last_name', 'email', 'phone', 'department_id', 'designation', 'joining_date', 'employment_status', 'reporting_manager_id', 'emergency_contact', 'base_salary', 'created_at', 'updated_at', 'is_deleted'],
    description: 'Employee directory, designations, and base profiles'
  },
  {
    name: 'Attendance',
    category: 'Human Resources',
    primaryKey: 'id',
    columns: ['id', 'employee_id', 'date', 'check_in', 'check_out', 'work_hours', 'status', 'remarks'],
    description: 'Daily clock-in/out records and working hours'
  },
  {
    name: 'Leave_Requests',
    category: 'Human Resources',
    primaryKey: 'id',
    columns: ['id', 'employee_id', 'employee_name', 'leave_type', 'start_date', 'end_date', 'total_days', 'reason', 'status', 'approved_by', 'created_at', 'updated_at'],
    description: 'Employee vacation, sick, and personal leave claims'
  },
  {
    name: 'Payroll_Records',
    category: 'Human Resources',
    primaryKey: 'id',
    columns: ['id', 'payroll_number', 'employee_id', 'employee_name', 'month', 'year', 'basic_salary', 'allowances', 'deductions', 'tax_withheld', 'net_salary', 'payment_status', 'payment_date', 'created_at'],
    description: 'Monthly payroll runs, statutory deductions, and pay slips'
  },
  {
    name: 'Employee_Documents',
    category: 'Human Resources',
    primaryKey: 'id',
    columns: ['id', 'employee_id', 'doc_type', 'doc_name', 'drive_file_id', 'expiry_date', 'uploaded_at'],
    description: 'Identity proofs, certifications, and contracts'
  },
  {
    name: 'Performance_Reviews',
    category: 'Human Resources',
    primaryKey: 'id',
    columns: ['id', 'employee_id', 'reviewer_id', 'period', 'score', 'feedback', 'goals', 'created_at'],
    description: 'Quarterly and annual performance appraisals'
  },

  // Finance and Expenses (43-50)
  {
    name: 'Expenses',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'expense_number', 'employee_id', 'employee_name', 'category_id', 'amount', 'tax_amount', 'expense_date', 'status', 'description', 'receipt_doc_id', 'approved_by', 'paid_date', 'created_at'],
    description: 'Company operational expenses and employee claims'
  },
  {
    name: 'Expense_Categories',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'name', 'account_code', 'is_active', 'budget_limit', 'created_at'],
    description: 'Classification types for spending management'
  },
  {
    name: 'Accounts',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'code', 'name', 'type', 'sub_type', 'current_balance', 'is_active', 'created_at'],
    description: 'Chart of accounts for general ledger (Asset, Liability, Equity, Revenue, Expense)'
  },
  {
    name: 'Journal_Entries',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'entry_number', 'entry_date', 'reference', 'description', 'total_debit', 'total_credit', 'status', 'posted_by', 'created_at'],
    description: 'Double-entry header records with debit-credit balancing'
  },
  {
    name: 'Journal_Entry_Lines',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'journal_entry_id', 'account_id', 'account_name', 'debit', 'credit', 'line_memo'],
    description: 'Individual debits and credits posted to ledger accounts'
  },
  {
    name: 'Budgets',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'department_id', 'fiscal_year', 'allocated_amount', 'spent_amount', 'remaining_amount', 'created_at'],
    description: 'Departmental annual expense allocations'
  },
  {
    name: 'Tax_Rates',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'name', 'rate_percent', 'type', 'cgst_rate', 'sgst_rate', 'igst_rate', 'is_active'],
    description: 'Applicable GST/VAT statutory tax tables'
  },
  {
    name: 'Financial_Periods',
    category: 'Finance & Expenses',
    primaryKey: 'id',
    columns: ['id', 'name', 'start_date', 'end_date', 'status', 'created_at'],
    description: 'Fiscal accounting open/closed reconciliation cycles'
  },

  // Projects and Operations (51-56)
  {
    name: 'Projects',
    category: 'Projects & Operations',
    primaryKey: 'id',
    columns: ['id', 'project_code', 'name', 'customer_id', 'manager_id', 'start_date', 'end_date', 'budget', 'status', 'completion_percent', 'description', 'created_at', 'updated_at'],
    description: 'Client projects, deliverables, milestones, and status'
  },
  {
    name: 'Tasks',
    category: 'Projects & Operations',
    primaryKey: 'id',
    columns: ['id', 'project_id', 'title', 'description', 'assigned_to', 'priority', 'status', 'due_date', 'estimated_hours', 'actual_hours', 'created_at', 'updated_at'],
    description: 'Project task tracking with Kanban status transitions'
  },
  {
    name: 'Project_Timesheets',
    category: 'Projects & Operations',
    primaryKey: 'id',
    columns: ['id', 'project_id', 'task_id', 'employee_id', 'work_date', 'hours', 'billable', 'hourly_rate', 'notes', 'created_at'],
    description: 'Logged billable and non-billable employee project hours'
  },
  {
    name: 'Service_Requests',
    category: 'Projects & Operations',
    primaryKey: 'id',
    columns: ['id', 'ticket_number', 'customer_id', 'subject', 'priority', 'status', 'assigned_agent_id', 'resolved_at', 'created_at'],
    description: 'Customer post-sales technical and operations support'
  },
  {
    name: 'Company_Assets',
    category: 'Projects & Operations',
    primaryKey: 'id',
    columns: ['id', 'asset_tag', 'name', 'category', 'serial_number', 'purchase_date', 'purchase_cost', 'assigned_to_employee_id', 'condition', 'status', 'created_at'],
    description: 'Hardware, machinery, laptops, and physical assets register'
  },
  {
    name: 'Maintenance_Records',
    category: 'Projects & Operations',
    primaryKey: 'id',
    columns: ['id', 'asset_id', 'service_date', 'service_type', 'cost', 'technician', 'notes', 'next_service_due', 'created_at'],
    description: 'Asset servicing, calibration, and maintenance logs'
  }
];

export function getWorksheetSchema(sheetName: string): WorksheetDefinition | undefined {
  return ERP_WORKSHEETS.find(w => w.name.toLowerCase() === sheetName.toLowerCase());
}
