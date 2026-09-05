import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Account,
  AnalyticAccount,
  Budget,
  Contact,
  CustomerInvoice,
  InvoiceLineItem,
  Journal,
  JournalEntry,
  Payment,
  Product,
  PurchaseOrder,
  POLineItem,
  SalesOrder,
  SOLineItem,
  VendorBill,
  BillLineItem,
  Role,
} from '../types';

interface AccountingContextType {
  // Master Data
  accounts: Account[];
  journals: Journal[];
  analyticAccounts: AnalyticAccount[];
  budgets: Budget[];
  contacts: Contact[];
  products: Product[];

  // Transactions
  purchaseOrders: PurchaseOrder[];
  vendorBills: VendorBill[];
  salesOrders: SalesOrder[];
  customerInvoices: CustomerInvoice[];
  payments: Payment[];
  journalEntries: JournalEntry[];

  // User & Role Switcher
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeCustomerContactId: string | null;
  setActiveCustomerContactId: (id: string | null) => void;

  // Actions
  createPurchaseOrder: (vendorId: string, lines: { productId: string; quantity: number; unitPrice: number; taxRate: number; analyticAccountId?: string }[]) => void;
  confirmPurchaseOrder: (poId: string) => void;
  convertPOToVendorBill: (poId: string) => void;

  createSalesOrder: (customerId: string, lines: { productId: string; quantity: number; unitPrice: number; taxRate: number; analyticAccountId?: string }[]) => void;
  confirmSalesOrder: (soId: string) => void;
  convertSOToCustomerInvoice: (soId: string) => void;

  registerBillPayment: (billId: string, amount: number, paymentMethod: 'cash' | 'bank') => void;
  registerInvoicePayment: (invoiceId: string, amount: number, paymentMethod: 'cash' | 'bank') => void;

  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  resetToDefaultData: () => void;
}

const AccountingContext = createContext<AccountingContextType | null>(null);

// Initial Accounts
const initialAccounts: Account[] = [
  { id: 'acc-1', name: '1010 - Petty Cash', type: 'asset', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-2', name: '1020 - Commercial Bank Account', type: 'asset', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-3', name: '1200 - Accounts Receivable', type: 'asset', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-4', name: '1300 - Furniture Inventory', type: 'asset', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-5', name: '2010 - Accounts Payable', type: 'liability', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-6', name: '2020 - Output Tax Payable (GST 18%)', type: 'liability', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-7', name: '3010 - Shareholder Equity', type: 'capital', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-8', name: '3020 - Retained Earnings', type: 'capital', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-9', name: '4010 - Furniture Sales Revenue', type: 'income', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-10', name: '4020 - Assembly & Delivery Services', type: 'income', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-11', name: '5010 - Cost of Goods Sold (Raw Materials)', type: 'expense', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-12', name: '5020 - Showroom Rent & Utilities', type: 'expense', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'acc-13', name: '5030 - Logistics & Transport Expense', type: 'expense', isSystemDefault: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

// Initial Journals
const initialJournals: Journal[] = [
  { id: 'j-sales', name: 'Customer Invoicing Journal', type: 'sales', defaultAccountId: 'acc-9', defaultAccount: initialAccounts[8], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'j-purchase', name: 'Vendor Bills Journal', type: 'purchase', defaultAccountId: 'acc-11', defaultAccount: initialAccounts[10], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'j-bank', name: 'Commercial Bank Journal', type: 'bank', defaultAccountId: 'acc-2', defaultAccount: initialAccounts[1], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'j-cash', name: 'Showroom Cash Register', type: 'cash', defaultAccountId: 'acc-1', defaultAccount: initialAccounts[0], createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

// Initial Analytic Accounts
const initialAnalyticAccounts: AnalyticAccount[] = [
  { id: 'ana-1', name: 'Commercial Corporate Fitouts', type: 'income', description: 'Office & Workspace Installations', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'ana-2', name: 'Luxury Residential Interior', type: 'income', description: 'Villas & Private Residences', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'ana-3', name: 'Showroom Retail & Walk-ins', type: 'income', description: 'Direct customer purchases', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

// Initial Budgets
const initialBudgets: Budget[] = [
  { id: 'bud-1', name: 'Q3 Corporate Procurement Budget', startDate: '2026-07-01', endDate: '2026-09-30', plannedAmount: 85000, analyticAccountId: 'ana-1', analyticAccount: initialAnalyticAccounts[0], createdAt: '2026-07-01', updatedAt: '2026-07-01' },
  { id: 'bud-2', name: 'Luxury Wood Supply & Staging', startDate: '2026-07-01', endDate: '2026-09-30', plannedAmount: 45000, analyticAccountId: 'ana-2', analyticAccount: initialAnalyticAccounts[1], createdAt: '2026-07-01', updatedAt: '2026-07-01' },
];

// Initial Products
const initialProducts: Product[] = [
  { id: 'prod-1', name: 'AeroFlex Ergonomic Mesh Chair', type: 'goods', salesPrice: 450, costPrice: 220, category: 'Seating', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'prod-2', name: 'Solid Walnut Executive Desk 200cm', type: 'goods', salesPrice: 1850, costPrice: 950, category: 'Desks & Tables', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'prod-3', name: 'Nordic Modular 3-Seater Velvet Sofa', type: 'goods', salesPrice: 2400, costPrice: 1300, category: 'Lounge', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'prod-4', name: 'Acoustic Sound-Dampening Partition', type: 'goods', salesPrice: 380, costPrice: 180, category: 'Partitions', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'prod-5', name: 'Executive Suite Setup Combo', type: 'combo', salesPrice: 3200, costPrice: 1700, category: 'Bundles', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'prod-6', name: 'On-Site White-Glove Installation', type: 'service', salesPrice: 200, costPrice: 80, category: 'Services', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

// Initial Contacts
const initialContacts: Contact[] = [
  { id: 'cont-1', name: 'Acme Global Technologies', type: 'customer', email: 'procurement@acmetech.com', mobile: '+1 (555) 234-8901', city: 'San Francisco', state: 'CA', pincode: '94105', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cont-2', name: 'Horizon Architecture Studio', type: 'customer', email: 'design@horizonstudio.io', mobile: '+1 (555) 876-1234', city: 'Seattle', state: 'WA', pincode: '98101', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cont-3', name: 'TimberCraft Hardwoods Ltd', type: 'vendor', email: 'orders@timbercraft.com', mobile: '+1 (555) 432-6789', city: 'Portland', state: 'OR', pincode: '97201', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cont-4', name: 'ErgoMech Components Inc', type: 'vendor', email: 'sales@ergomech.com', mobile: '+1 (555) 345-9876', city: 'Chicago', state: 'IL', pincode: '60601', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'cont-5', name: 'Metropolitan Logistics & Staging', type: 'both', email: 'ops@metrologistics.com', mobile: '+1 (555) 901-2345', city: 'Austin', state: 'TX', pincode: '78701', isArchived: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role>('admin');
  const [activeCustomerContactId, setActiveCustomerContactId] = useState<string | null>('cont-1');

  // Master Data
  const [accounts] = useState<Account[]>(initialAccounts);
  const [journals] = useState<Journal[]>(initialJournals);
  const [analyticAccounts] = useState<AnalyticAccount[]>(initialAnalyticAccounts);
  const [budgets] = useState<Budget[]>(initialBudgets);
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('uf_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('uf_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Seed initial Transactions
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('uf_pos');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'po-101',
        poNumber: 'PO-2026-0001',
        vendorId: 'cont-3',
        vendor: initialContacts[2],
        orderDate: '2026-08-10',
        status: 'billed',
        totalAmount: 11210,
        createdAt: '2026-08-10',
        updatedAt: '2026-08-10',
        lineItems: [
          { id: 'poli-1', poId: 'po-101', productId: 'prod-2', product: initialProducts[1], quantity: 10, unitPrice: 950, subtotal: 9500, taxRate: 18, taxAmount: 1710, total: 11210, analyticAccountId: 'ana-1' },
        ],
      },
      {
        id: 'po-102',
        poNumber: 'PO-2026-0002',
        vendorId: 'cont-4',
        vendor: initialContacts[3],
        orderDate: '2026-08-20',
        status: 'confirmed',
        totalAmount: 5192,
        createdAt: '2026-08-20',
        updatedAt: '2026-08-20',
        lineItems: [
          { id: 'poli-2', poId: 'po-102', productId: 'prod-1', product: initialProducts[0], quantity: 20, unitPrice: 220, subtotal: 4400, taxRate: 18, taxAmount: 792, total: 5192, analyticAccountId: 'ana-1' },
        ],
      },
    ];
  });

  const [vendorBills, setVendorBills] = useState<VendorBill[]>(() => {
    const saved = localStorage.getItem('uf_bills');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'bill-201',
        billNumber: 'BILL-2026-0001',
        vendorId: 'cont-3',
        vendor: initialContacts[2],
        purchaseOrderId: 'po-101',
        billDate: '2026-08-12',
        dueDate: '2026-09-12',
        totalAmount: 11210,
        amountPaid: 11210,
        paymentStatus: 'paid',
        createdAt: '2026-08-12',
        updatedAt: '2026-08-15',
        lineItems: [
          { id: 'bli-1', billId: 'bill-201', productId: 'prod-2', product: initialProducts[1], quantity: 10, unitPrice: 950, subtotal: 9500, taxRate: 18, taxAmount: 1710, total: 11210, analyticAccountId: 'ana-1' },
        ],
      },
    ];
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem('uf_sos');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'so-301',
        soNumber: 'SO-2026-0001',
        customerId: 'cont-1',
        customer: initialContacts[0],
        orderDate: '2026-08-15',
        status: 'invoiced',
        totalAmount: 21830,
        createdAt: '2026-08-15',
        updatedAt: '2026-08-15',
        lineItems: [
          { id: 'soli-1', soId: 'so-301', productId: 'prod-2', product: initialProducts[1], quantity: 10, unitPrice: 1850, subtotal: 18500, taxRate: 18, taxAmount: 3330, total: 21830, analyticAccountId: 'ana-1' },
        ],
      },
      {
        id: 'so-302',
        soNumber: 'SO-2026-0002',
        customerId: 'cont-2',
        customer: initialContacts[1],
        orderDate: '2026-08-28',
        status: 'confirmed',
        totalAmount: 7670,
        createdAt: '2026-08-28',
        updatedAt: '2026-08-28',
        lineItems: [
          { id: 'soli-2', soId: 'so-302', productId: 'prod-3', product: initialProducts[2], quantity: 2, unitPrice: 2400, subtotal: 4800, taxRate: 18, taxAmount: 864, total: 5664, analyticAccountId: 'ana-2' },
          { id: 'soli-3', soId: 'so-302', productId: 'prod-6', product: initialProducts[5], quantity: 1, unitPrice: 200, subtotal: 200, taxRate: 18, taxAmount: 36, total: 236, analyticAccountId: 'ana-2' },
        ],
      },
    ];
  });

  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>(() => {
    const saved = localStorage.getItem('uf_invoices');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'inv-401',
        invoiceNumber: 'INV-2026-0001',
        customerId: 'cont-1',
        customer: initialContacts[0],
        salesOrderId: 'so-301',
        invoiceDate: '2026-08-16',
        dueDate: '2026-09-16',
        totalAmount: 21830,
        amountPaid: 10000,
        paymentStatus: 'partial',
        createdAt: '2026-08-16',
        updatedAt: '2026-08-22',
        lineItems: [
          { id: 'ili-1', invoiceId: 'inv-401', productId: 'prod-2', product: initialProducts[1], quantity: 10, unitPrice: 1850, subtotal: 18500, taxRate: 18, taxAmount: 3330, total: 21830, analyticAccountId: 'ana-1' },
        ],
      },
    ];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('uf_payments');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'pay-501',
        paymentNumber: 'PAY-2026-0001',
        paymentDate: '2026-08-15',
        amount: 11210,
        method: 'bank',
        direction: 'outgoing',
        paidAgainst: 'vendor_bill',
        vendorBillId: 'bill-201',
        reference: 'WIRE-TC-98012',
        createdAt: '2026-08-15',
        updatedAt: '2026-08-15',
      },
      {
        id: 'pay-502',
        paymentNumber: 'PAY-2026-0002',
        paymentDate: '2026-08-22',
        amount: 10000,
        method: 'bank',
        direction: 'incoming',
        paidAgainst: 'customer_invoice',
        customerInvoiceId: 'inv-401',
        reference: 'ACH-ACME-5521',
        createdAt: '2026-08-22',
        updatedAt: '2026-08-22',
      },
    ];
  });

  // Seed double-entry Journal Entries matching accounting rules A, B, C, D
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('uf_je');
    if (saved) return JSON.parse(saved);
    return [
      // Rule B: Vendor Bill creation (Dr. Expense $9,500, Dr. Tax $1,710, Cr. Accounts Payable $11,210)
      {
        id: 'je-601',
        journalId: 'j-purchase',
        journal: initialJournals[1],
        date: '2026-08-12',
        reference: 'BILL-2026-0001 (Rule B: Vendor Bill Recorded)',
        sourceType: 'purchase_bill',
        sourceId: 'bill-201',
        createdAt: '2026-08-12',
        items: [
          { id: 'jei-1', accountId: 'acc-11', account: initialAccounts[10], debit: 9500, credit: 0, analyticAccountId: 'ana-1', analyticAccount: initialAnalyticAccounts[0] },
          { id: 'jei-2', accountId: 'acc-6', account: initialAccounts[5], debit: 1710, credit: 0 },
          { id: 'jei-3', accountId: 'acc-5', account: initialAccounts[4], debit: 0, credit: 11210 },
        ],
      },
      // Rule A: Vendor Bill Payment (Dr. Accounts Payable $11,210, Cr. Bank $11,210)
      {
        id: 'je-602',
        journalId: 'j-bank',
        journal: initialJournals[2],
        date: '2026-08-15',
        reference: 'PAY-2026-0001 (Rule A: Vendor Bill Paid via Bank)',
        sourceType: 'payment',
        sourceId: 'pay-501',
        createdAt: '2026-08-15',
        items: [
          { id: 'jei-4', accountId: 'acc-5', account: initialAccounts[4], debit: 11210, credit: 0 },
          { id: 'jei-5', accountId: 'acc-2', account: initialAccounts[1], debit: 0, credit: 11210 },
        ],
      },
      // Rule C: Customer Invoice creation (Dr. Accounts Receivable $21,830, Cr. Sales Revenue $18,500, Cr. Tax Payable $3,330)
      {
        id: 'je-603',
        journalId: 'j-sales',
        journal: initialJournals[0],
        date: '2026-08-16',
        reference: 'INV-2026-0001 (Rule C: Sales Invoice Issued)',
        sourceType: 'sales_invoice',
        sourceId: 'inv-401',
        createdAt: '2026-08-16',
        items: [
          { id: 'jei-6', accountId: 'acc-3', account: initialAccounts[2], debit: 21830, credit: 0 },
          { id: 'jei-7', accountId: 'acc-9', account: initialAccounts[8], debit: 0, credit: 18500, analyticAccountId: 'ana-1', analyticAccount: initialAnalyticAccounts[0] },
          { id: 'jei-8', accountId: 'acc-6', account: initialAccounts[5], debit: 0, credit: 3330 },
        ],
      },
      // Rule D: Customer Invoice Payment (Dr. Bank $10,000, Cr. Accounts Receivable $10,000)
      {
        id: 'je-604',
        journalId: 'j-bank',
        journal: initialJournals[2],
        date: '2026-08-22',
        reference: 'PAY-2026-0002 (Rule D: Partial Customer Payment)',
        sourceType: 'payment',
        sourceId: 'pay-502',
        createdAt: '2026-08-22',
        items: [
          { id: 'jei-9', accountId: 'acc-2', account: initialAccounts[1], debit: 10000, credit: 0 },
          { id: 'jei-10', accountId: 'acc-3', account: initialAccounts[2], debit: 0, credit: 10000 },
        ],
      },
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('uf_contacts', JSON.stringify(contacts));
    localStorage.setItem('uf_products', JSON.stringify(products));
    localStorage.setItem('uf_pos', JSON.stringify(purchaseOrders));
    localStorage.setItem('uf_bills', JSON.stringify(vendorBills));
    localStorage.setItem('uf_sos', JSON.stringify(salesOrders));
    localStorage.setItem('uf_invoices', JSON.stringify(customerInvoices));
    localStorage.setItem('uf_payments', JSON.stringify(payments));
    localStorage.setItem('uf_je', JSON.stringify(journalEntries));
  }, [contacts, products, purchaseOrders, vendorBills, salesOrders, customerInvoices, payments, journalEntries]);

  // Actions
  const createPurchaseOrder = (vendorId: string, lines: { productId: string; quantity: number; unitPrice: number; taxRate: number; analyticAccountId?: string }[]) => {
    const vendor = contacts.find((c) => c.id === vendorId);
    if (!vendor) return;

    const poNumber = `PO-2026-${String(purchaseOrders.length + 1).padStart(4, '0')}`;
    const id = `po-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const lineItems: POLineItem[] = lines.map((l, idx) => {
      const product = products.find((p) => p.id === l.productId)!;
      const subtotal = l.quantity * l.unitPrice;
      const taxAmount = (subtotal * l.taxRate) / 100;
      return {
        id: `poli-${id}-${idx}`,
        poId: id,
        productId: l.productId,
        product,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        subtotal,
        taxRate: l.taxRate,
        taxAmount,
        total: subtotal + taxAmount,
        analyticAccountId: l.analyticAccountId,
      };
    });

    const totalAmount = lineItems.reduce((sum, item) => sum + (item.total ?? 0), 0);

    const newPO: PurchaseOrder = {
      id,
      poNumber,
      vendorId,
      vendor,
      orderDate: now,
      status: 'draft',
      totalAmount,
      lineItems,
      createdAt: now,
      updatedAt: now,
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
  };

  const confirmPurchaseOrder = (poId: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'confirmed' } : po))
    );
  };

  // Convert PO to Vendor Bill and generate Rule B Journal Entry
  const convertPOToVendorBill = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    const billNumber = `BILL-2026-${String(vendorBills.length + 1).padStart(4, '0')}`;
    const billId = `bill-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const lineItems: BillLineItem[] = po.lineItems.map((pli, idx) => ({
      id: `bli-${billId}-${idx}`,
      billId,
      productId: pli.productId,
      product: pli.product,
      quantity: pli.quantity,
      unitPrice: pli.unitPrice,
      subtotal: pli.subtotal,
      taxRate: pli.taxRate,
      taxAmount: pli.taxAmount,
      total: pli.total,
      analyticAccountId: pli.analyticAccountId,
    }));

    const newBill: VendorBill = {
      id: billId,
      billNumber,
      vendorId: po.vendorId,
      vendor: po.vendor,
      purchaseOrderId: po.id,
      billDate: now,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: po.totalAmount,
      amountPaid: 0,
      paymentStatus: 'unpaid',
      lineItems,
      createdAt: now,
      updatedAt: now,
    };

    // Generate Rule B Journal Entry:
    // Dr. Expense (COGS / Inventory)
    // Dr. Tax Output/Input
    // Cr. Accounts Payable
    const totalSubtotal = lineItems.reduce((s, i) => s + (i.subtotal ?? 0), 0);
    const totalTax = lineItems.reduce((s, i) => s + (i.taxAmount ?? 0), 0);

    const expenseAccount = accounts.find((a) => a.id === 'acc-11') || accounts[10];
    const taxAccount = accounts.find((a) => a.id === 'acc-6') || accounts[5];
    const apAccount = accounts.find((a) => a.id === 'acc-5') || accounts[4];
    const purchaseJournal = journals.find((j) => j.type === 'purchase') || journals[1];

    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      journalId: purchaseJournal.id,
      journal: purchaseJournal,
      date: now,
      reference: `${billNumber} (Rule B: Vendor Bill Posted)`,
      sourceType: 'purchase_bill',
      sourceId: billId,
      createdAt: now,
      items: [
        { id: `jei-b1-${Date.now()}`, accountId: expenseAccount.id, account: expenseAccount, debit: totalSubtotal, credit: 0, analyticAccountId: lineItems[0]?.analyticAccountId },
        { id: `jei-b2-${Date.now()}`, accountId: taxAccount.id, account: taxAccount, debit: totalTax, credit: 0 },
        { id: `jei-b3-${Date.now()}`, accountId: apAccount.id, account: apAccount, debit: 0, credit: po.totalAmount },
      ],
    };

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'billed' } : p))
    );
    setVendorBills([newBill, ...vendorBills]);
    setJournalEntries([newJE, ...journalEntries]);
  };

  const createSalesOrder = (customerId: string, lines: { productId: string; quantity: number; unitPrice: number; taxRate: number; analyticAccountId?: string }[]) => {
    const customer = contacts.find((c) => c.id === customerId);
    if (!customer) return;

    const soNumber = `SO-2026-${String(salesOrders.length + 1).padStart(4, '0')}`;
    const id = `so-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const lineItems: SOLineItem[] = lines.map((l, idx) => {
      const product = products.find((p) => p.id === l.productId)!;
      const subtotal = l.quantity * l.unitPrice;
      const taxAmount = (subtotal * l.taxRate) / 100;
      return {
        id: `soli-${id}-${idx}`,
        soId: id,
        productId: l.productId,
        product,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        subtotal,
        taxRate: l.taxRate,
        taxAmount,
        total: subtotal + taxAmount,
        analyticAccountId: l.analyticAccountId,
      };
    });

    const totalAmount = lineItems.reduce((sum, item) => sum + (item.total ?? 0), 0);

    const newSO: SalesOrder = {
      id,
      soNumber,
      customerId,
      customer,
      orderDate: now,
      status: 'draft',
      totalAmount,
      lineItems,
      createdAt: now,
      updatedAt: now,
    };

    setSalesOrders([newSO, ...salesOrders]);
  };

  const confirmSalesOrder = (soId: string) => {
    setSalesOrders((prev) =>
      prev.map((so) => (so.id === soId ? { ...so, status: 'confirmed' } : so))
    );
  };

  // Convert SO to Customer Invoice and generate Rule C Journal Entry
  const convertSOToCustomerInvoice = (soId: string) => {
    const so = salesOrders.find((s) => s.id === soId);
    if (!so) return;

    const invoiceNumber = `INV-2026-${String(customerInvoices.length + 1).padStart(4, '0')}`;
    const invoiceId = `inv-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const lineItems: InvoiceLineItem[] = so.lineItems.map((sli, idx) => ({
      id: `ili-${invoiceId}-${idx}`,
      invoiceId,
      productId: sli.productId,
      product: sli.product,
      quantity: sli.quantity,
      unitPrice: sli.unitPrice,
      subtotal: sli.subtotal,
      taxRate: sli.taxRate,
      taxAmount: sli.taxAmount,
      total: sli.total,
      analyticAccountId: sli.analyticAccountId,
    }));

    const newInvoice: CustomerInvoice = {
      id: invoiceId,
      invoiceNumber,
      customerId: so.customerId,
      customer: so.customer,
      salesOrderId: so.id,
      invoiceDate: now,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: so.totalAmount,
      amountPaid: 0,
      paymentStatus: 'unpaid',
      lineItems,
      createdAt: now,
      updatedAt: now,
    };

    // Generate Rule C Journal Entry:
    // Dr. Accounts Receivable
    // Cr. Sales Revenue
    // Cr. Tax Payable
    const totalSubtotal = lineItems.reduce((s, i) => s + (i.subtotal ?? 0), 0);
    const totalTax = lineItems.reduce((s, i) => s + (i.taxAmount ?? 0), 0);

    const arAccount = accounts.find((a) => a.id === 'acc-3') || accounts[2];
    const revenueAccount = accounts.find((a) => a.id === 'acc-9') || accounts[8];
    const taxAccount = accounts.find((a) => a.id === 'acc-6') || accounts[5];
    const salesJournal = journals.find((j) => j.type === 'sales') || journals[0];

    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      journalId: salesJournal.id,
      journal: salesJournal,
      date: now,
      reference: `${invoiceNumber} (Rule C: Sales Invoice Issued)`,
      sourceType: 'sales_invoice',
      sourceId: invoiceId,
      createdAt: now,
      items: [
        { id: `jei-c1-${Date.now()}`, accountId: arAccount.id, account: arAccount, debit: so.totalAmount, credit: 0 },
        { id: `jei-c2-${Date.now()}`, accountId: revenueAccount.id, account: revenueAccount, debit: 0, credit: totalSubtotal, analyticAccountId: lineItems[0]?.analyticAccountId },
        { id: `jei-c3-${Date.now()}`, accountId: taxAccount.id, account: taxAccount, debit: 0, credit: totalTax },
      ],
    };

    setSalesOrders((prev) =>
      prev.map((s) => (s.id === soId ? { ...s, status: 'invoiced' } : s))
    );
    setCustomerInvoices([newInvoice, ...customerInvoices]);
    setJournalEntries([newJE, ...journalEntries]);
  };

  // Register Payment for Vendor Bill and generate Rule A Journal Entry
  const registerBillPayment = (billId: string, amount: number, paymentMethod: 'cash' | 'bank') => {
    const bill = vendorBills.find((b) => b.id === billId);
    if (!bill) return;

    const remaining = bill.totalAmount - bill.amountPaid;
    const payAmount = Math.min(amount, remaining);
    const newPaid = bill.amountPaid + payAmount;
    const newStatus = newPaid >= bill.totalAmount ? 'paid' : 'partial';

    const payNumber = `PAY-2026-${String(payments.length + 1).padStart(4, '0')}`;
    const payId = `pay-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const newPayment: Payment = {
      id: payId,
      paymentNumber: payNumber,
      paymentDate: now,
      amount: payAmount,
      method: paymentMethod,
      direction: 'outgoing',
      paidAgainst: 'vendor_bill',
      vendorBillId: billId,
      reference: `Payment for ${bill.billNumber}`,
      createdAt: now,
      updatedAt: now,
    };

    // Generate Rule A Journal Entry:
    // Dr. Accounts Payable
    // Cr. Cash/Bank
    const apAccount = accounts.find((a) => a.id === 'acc-5') || accounts[4];
    const moneyAccount = accounts.find((a) => a.id === (paymentMethod === 'bank' ? 'acc-2' : 'acc-1')) || accounts[1];
    const moneyJournal = journals.find((j) => j.type === paymentMethod) || journals[2];

    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      journalId: moneyJournal.id,
      journal: moneyJournal,
      date: now,
      reference: `${payNumber} (Rule A: Vendor Bill Payment)`,
      sourceType: 'payment',
      sourceId: payId,
      createdAt: now,
      items: [
        { id: `jei-a1-${Date.now()}`, accountId: apAccount.id, account: apAccount, debit: payAmount, credit: 0 },
        { id: `jei-a2-${Date.now()}`, accountId: moneyAccount.id, account: moneyAccount, debit: 0, credit: payAmount },
      ],
    };

    setVendorBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, amountPaid: newPaid, paymentStatus: newStatus } : b))
    );
    setPayments([newPayment, ...payments]);
    setJournalEntries([newJE, ...journalEntries]);
  };

  // Register Payment for Customer Invoice and generate Rule D Journal Entry
  const registerInvoicePayment = (invoiceId: string, amount: number, paymentMethod: 'cash' | 'bank') => {
    const inv = customerInvoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const remaining = inv.totalAmount - inv.amountPaid;
    const payAmount = Math.min(amount, remaining);
    const newPaid = inv.amountPaid + payAmount;
    const newStatus = newPaid >= inv.totalAmount ? 'paid' : 'partial';

    const payNumber = `PAY-2026-${String(payments.length + 1).padStart(4, '0')}`;
    const payId = `pay-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const newPayment: Payment = {
      id: payId,
      paymentNumber: payNumber,
      paymentDate: now,
      amount: payAmount,
      method: paymentMethod,
      direction: 'incoming',
      paidAgainst: 'customer_invoice',
      customerInvoiceId: invoiceId,
      reference: `Receipt for ${inv.invoiceNumber}`,
      createdAt: now,
      updatedAt: now,
    };

    // Generate Rule D Journal Entry:
    // Dr. Cash/Bank
    // Cr. Accounts Receivable
    const arAccount = accounts.find((a) => a.id === 'acc-3') || accounts[2];
    const moneyAccount = accounts.find((a) => a.id === (paymentMethod === 'bank' ? 'acc-2' : 'acc-1')) || accounts[1];
    const moneyJournal = journals.find((j) => j.type === paymentMethod) || journals[2];

    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      journalId: moneyJournal.id,
      journal: moneyJournal,
      date: now,
      reference: `${payNumber} (Rule D: Customer Invoice Payment)`,
      sourceType: 'payment',
      sourceId: payId,
      createdAt: now,
      items: [
        { id: `jei-d1-${Date.now()}`, accountId: moneyAccount.id, account: moneyAccount, debit: payAmount, credit: 0 },
        { id: `jei-d2-${Date.now()}`, accountId: arAccount.id, account: arAccount, debit: 0, credit: payAmount },
      ],
    };

    setCustomerInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, amountPaid: newPaid, paymentStatus: newStatus } : i))
    );
    setPayments([newPayment, ...payments]);
    setJournalEntries([newJE, ...journalEntries]);
  };

  const addContact = (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newContact: Contact = {
      ...data,
      id: `cont-${Date.now()}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    setContacts([newContact, ...contacts]);
  };

  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    setProducts([newProduct, ...products]);
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AccountingContext.Provider
      value={{
        accounts,
        journals,
        analyticAccounts,
        budgets,
        contacts,
        products,
        purchaseOrders,
        vendorBills,
        salesOrders,
        customerInvoices,
        payments,
        journalEntries,
        activeRole,
        setActiveRole,
        activeCustomerContactId,
        setActiveCustomerContactId,
        createPurchaseOrder,
        confirmPurchaseOrder,
        convertPOToVendorBill,
        createSalesOrder,
        confirmSalesOrder,
        convertSOToCustomerInvoice,
        registerBillPayment,
        registerInvoicePayment,
        addContact,
        addProduct,
        resetToDefaultData,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const ctx = useContext(AccountingContext);
  if (!ctx) throw new Error('useAccounting must be used within AccountingProvider');
  return ctx;
};
