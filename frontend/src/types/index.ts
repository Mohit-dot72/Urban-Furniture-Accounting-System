// Shared TypeScript types mirroring backend DTOs

export type Role = 'admin' | 'accountant' | 'contact';
export type ContactType = 'customer' | 'vendor' | 'both';
export type ProductType = 'goods' | 'service' | 'combo';
export type AccountType = 'asset' | 'liability' | 'expense' | 'income' | 'capital';
export type JournalType = 'sales' | 'purchase' | 'bank' | 'cash';
export type SourceType = 'purchase_bill' | 'sales_invoice' | 'payment' | 'manual';
export type AnalyticType = 'income' | 'expense';
export type OrderStatus = 'draft' | 'confirmed' | 'billed' | 'cancelled';
export type SOStatus = 'draft' | 'confirmed' | 'invoiced' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'bank';
export type PaymentDirection = 'incoming' | 'outgoing';
export type PaymentAgainst = 'vendor_bill' | 'customer_invoice';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  contactId?: string | null;
}

export interface AuthUser {
  userId: string;
  role: Role;
  contactId?: string | null;
  name: string;
  email: string;
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  mobile: string;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  profileImageUrl?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  category?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Journal {
  id: string;
  name: string;
  type: JournalType;
  defaultAccountId: string;
  defaultAccount: Account;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryItem {
  id: string;
  accountId: string;
  account: Account;
  debit: number;
  credit: number;
  analyticAccountId?: string | null;
  analyticAccount?: AnalyticAccount | null;
}

export interface JournalEntry {
  id: string;
  journalId: string;
  journal: Journal;
  date: string;
  reference?: string | null;
  sourceType: SourceType;
  sourceId?: string | null;
  items: JournalEntryItem[];
  createdAt: string;
}

export interface AnalyticAccount {
  id: string;
  name: string;
  type: AnalyticType;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  responsiblePerson?: string;
  plannedAmount: number;
  analyticAccountId: string;
  analyticAccount?: AnalyticAccount;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderLineItem {
  id: string;
  poId?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  analyticAccountId?: string | null;
}
export type POLineItem = PurchaseOrderLineItem;

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor: Contact;
  orderDate?: string;
  status: OrderStatus;
  totalAmount: number;
  lineItems: PurchaseOrderLineItem[];
  vendorBill?: VendorBill | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorBillLineItem {
  id: string;
  billId?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  analyticAccountId?: string | null;
}
export type BillLineItem = VendorBillLineItem;

export interface VendorBill {
  id: string;
  billNumber: string;
  purchaseOrderId?: string;
  purchaseOrder?: PurchaseOrder;
  vendorId: string;
  vendor: Contact;
  invoiceDate?: string;
  billDate?: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  lineItems: VendorBillLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderLineItem {
  id: string;
  soId?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  analyticAccountId?: string | null;
}
export type SOLineItem = SalesOrderLineItem;

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  customer: Contact;
  orderDate?: string;
  status: SOStatus;
  totalAmount: number;
  lineItems: SalesOrderLineItem[];
  invoice?: CustomerInvoice | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceLineItem {
  id: string;
  invoiceId?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  analyticAccountId?: string | null;
}
export type InvoiceLineItem = CustomerInvoiceLineItem;

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId?: string;
  salesOrder?: SalesOrder;
  customerId: string;
  customer: Contact;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  lineItems: CustomerInvoiceLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  direction: PaymentDirection;
  against?: PaymentAgainst;
  paidAgainst?: PaymentAgainst;
  referenceId?: string;
  vendorBillId?: string | null;
  customerInvoiceId?: string | null;
  method: PaymentMethod;
  amount: number;
  date?: string;
  paymentDate?: string;
  reference?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// Report types
export interface BalanceSheetLine {
  accountId: string;
  accountName: string;
  balance: number;
}

export interface BalanceSheetReport {
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  capital: BalanceSheetLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalCapital: number;
  isBalanced: boolean;
}

export interface PnLLine {
  accountId: string;
  accountName: string;
  amount: number;
}

export interface ProfitAndLossReport {
  income: PnLLine[];
  expenses: PnLLine[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface BudgetReportLine {
  budgetId: string;
  budgetName: string;
  analyticAccountId: string;
  analyticAccountName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  percentUsed: number;
  startDate: string;
  endDate: string;
}
