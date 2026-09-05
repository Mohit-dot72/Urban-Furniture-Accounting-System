import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { postJournalEntry } from '../../lib/accounting/postJournalEntry';

export const getSalesOrders = async () => {
  return prisma.salesOrder.findMany({
    include: { customer: true, lineItems: true, invoice: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getSalesOrderById = async (id: string) => {
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { customer: true, lineItems: true, invoice: true },
  });
  if (!so) throw new AppError(404, 'Sales order not found');
  return so;
};

export const createSalesOrder = async (data: {
  customerId: string;
  lineItems: { productId: string; quantity: number; unitPrice: number; taxRate?: number }[];
}) => {
  const totalAmount = data.lineItems.reduce((s, li) => {
    const base = li.quantity * li.unitPrice;
    const tax = base * (li.taxRate ?? 0) / 100;
    return s + base + tax;
  }, 0);

  return prisma.$transaction(async (tx) => {
    const counter = await tx.counter.update({ where: { key: 'SO' }, data: { seq: { increment: 1 } } });
    const soNumber = `SO-${String(counter.seq).padStart(4, '0')}`;

    return tx.salesOrder.create({
      data: {
        soNumber,
        customerId: data.customerId,
        status: 'draft',
        totalAmount,
        lineItems: {
          create: data.lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            taxRate: li.taxRate ?? 0,
          })),
        },
      },
      include: { customer: true, lineItems: true },
    });
  });
};

export const updateSalesOrder = async (id: string, data: { status?: 'confirmed' | 'cancelled' }) => {
  const so = await getSalesOrderById(id);
  if (so.status === 'invoiced') throw new AppError(400, 'Cannot modify an invoiced SO');
  return prisma.salesOrder.update({ where: { id }, data, include: { customer: true, lineItems: true } });
};

export const convertToInvoice = async (id: string, invoiceDate: string, dueDate: string) => {
  const so = await getSalesOrderById(id);
  if (so.status !== 'confirmed') throw new AppError(400, 'SO must be confirmed before converting to invoice');
  if (so.invoice) throw new AppError(400, 'Invoice already exists for this SO');

  const invDate = new Date(invoiceDate);
  const due = new Date(dueDate);
  if (due < invDate) throw new AppError(400, 'dueDate must be >= invoiceDate');

  // Get required accounts
  const debtors = await prisma.account.findFirst({ where: { name: 'Debtors' } });
  const saleIncome = await prisma.account.findFirst({ where: { name: 'Sale Income' } });
  const taxPayable = await prisma.account.findFirst({ where: { name: 'Tax Payable' } });
  const salesJournal = await prisma.journal.findFirst({ where: { type: 'sales' } });

  if (!debtors || !saleIncome || !taxPayable || !salesJournal)
    throw new AppError(500, 'System accounts/journal not found. Please run seed.');

  // Calculate totals
  const baseAmount = so.lineItems.reduce((s, li) => s + li.quantity * Number(li.unitPrice), 0);
  const taxAmount = so.lineItems.reduce((s, li) => {
    return s + li.quantity * Number(li.unitPrice) * Number(li.taxRate) / 100;
  }, 0);
  const totalAmount = baseAmount + taxAmount;

  return prisma.$transaction(async (tx) => {
    const counter = await tx.counter.update({ where: { key: 'INV' }, data: { seq: { increment: 1 } } });
    const invoiceNumber = `INV-${String(counter.seq).padStart(4, '0')}`;

    const invoice = await tx.customerInvoice.create({
      data: {
        invoiceNumber,
        salesOrderId: id,
        customerId: so.customerId,
        invoiceDate: invDate,
        dueDate: due,
        totalAmount,
        lineItems: {
          create: so.lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            taxRate: li.taxRate,
          })),
        },
      },
    });

    // Rule C: Debit Debtors, Credit Sale Income (+ Tax Payable if tax)
    const journalItems: { accountId: string; debit: number; credit: number }[] = [
      { accountId: debtors.id, debit: totalAmount, credit: 0 },
      { accountId: saleIncome.id, debit: 0, credit: baseAmount },
    ];
    if (taxAmount > 0) {
      journalItems.push({ accountId: taxPayable.id, debit: 0, credit: taxAmount });
    }

    await postJournalEntry(tx as typeof prisma, {
      journalId: salesJournal.id,
      date: invDate,
      reference: invoiceNumber,
      sourceType: 'sales_invoice',
      sourceId: invoice.id,
      items: journalItems,
    });

    await tx.salesOrder.update({ where: { id }, data: { status: 'invoiced' } });

    return invoice;
  });
};
