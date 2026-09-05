import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { postJournalEntry } from '../../lib/accounting/postJournalEntry';
import { generateDocumentNumber } from '../../utils/generateDocumentNumber';

export const getPurchaseOrders = async () => {
  return prisma.purchaseOrder.findMany({
    include: {
      vendor: true,
      lineItems: true,
      vendorBill: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPurchaseOrderById = async (id: string) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { vendor: true, lineItems: true, vendorBill: true },
  });
  if (!po) throw new AppError(404, 'Purchase order not found');
  return po;
};

export const createPurchaseOrder = async (data: {
  vendorId: string;
  lineItems: { productId: string; quantity: number; unitPrice: number }[];
}) => {
  const totalAmount = data.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);

  return prisma.$transaction(async (tx) => {
    const counter = await tx.counter.update({ where: { key: 'PO' }, data: { seq: { increment: 1 } } });
    const poNumber = `PO-${String(counter.seq).padStart(4, '0')}`;

    return tx.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: data.vendorId,
        status: 'draft',
        totalAmount,
        lineItems: {
          create: data.lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          })),
        },
      },
      include: { vendor: true, lineItems: true },
    });
  });
};

export const updatePurchaseOrder = async (id: string, data: { status?: 'confirmed' | 'cancelled' }) => {
  const po = await getPurchaseOrderById(id);
  if (po.status === 'billed') throw new AppError(400, 'Cannot modify a billed PO');
  return prisma.purchaseOrder.update({ where: { id }, data, include: { vendor: true, lineItems: true } });
};

export const convertToBill = async (id: string, invoiceDate: string, dueDate: string) => {
  const po = await getPurchaseOrderById(id);
  if (po.status !== 'confirmed') throw new AppError(400, 'PO must be confirmed before converting to bill');
  if (po.vendorBill) throw new AppError(400, 'Bill already exists for this PO');

  const invDate = new Date(invoiceDate);
  const due = new Date(dueDate);
  if (due < invDate) throw new AppError(400, 'dueDate must be >= invoiceDate');

  // Get required accounts
  const purchaseExpense = await prisma.account.findFirst({ where: { name: 'Purchase Expense' } });
  const creditors = await prisma.account.findFirst({ where: { name: 'Creditors' } });
  const purchaseJournal = await prisma.journal.findFirst({ where: { type: 'purchase' } });

  if (!purchaseExpense || !creditors || !purchaseJournal)
    throw new AppError(500, 'System accounts/journal not found. Please run seed.');

  return prisma.$transaction(async (tx) => {
    // Generate bill number
    const counter = await tx.counter.update({ where: { key: 'BILL' }, data: { seq: { increment: 1 } } });
    const billNumber = `BILL-${String(counter.seq).padStart(4, '0')}`;

    // Create vendor bill
    const bill = await tx.vendorBill.create({
      data: {
        billNumber,
        purchaseOrderId: id,
        vendorId: po.vendorId,
        invoiceDate: invDate,
        dueDate: due,
        totalAmount: po.totalAmount,
        lineItems: {
          create: po.lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          })),
        },
      },
    });

    // Rule B: Debit Purchase Expense, Credit Creditors
    await postJournalEntry(tx as typeof prisma, {
      journalId: purchaseJournal.id,
      date: invDate,
      reference: billNumber,
      sourceType: 'purchase_bill',
      sourceId: bill.id,
      items: [
        { accountId: purchaseExpense.id, debit: Number(po.totalAmount), credit: 0 },
        { accountId: creditors.id, debit: 0, credit: Number(po.totalAmount) },
      ],
    });

    // Update PO status
    await tx.purchaseOrder.update({ where: { id }, data: { status: 'billed' } });

    return bill;
  });
};
