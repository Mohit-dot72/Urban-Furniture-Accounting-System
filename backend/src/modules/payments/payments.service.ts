import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { postJournalEntry } from '../../lib/accounting/postJournalEntry';

const computePaymentStatus = (amountPaid: number, totalAmount: number) => {
  if (amountPaid <= 0) return 'unpaid' as const;
  if (amountPaid >= totalAmount) return 'paid' as const;
  return 'partial' as const;
};

export const getPayments = async () => {
  return prisma.payment.findMany({ orderBy: { date: 'desc' } });
};

export const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new AppError(404, 'Payment not found');
  return payment;
};

export const createPayment = async (data: {
  direction: 'incoming' | 'outgoing';
  against: 'vendor_bill' | 'customer_invoice';
  referenceId: string;
  method: 'cash' | 'bank';
  amount: number;
  date?: string;
}) => {
  if (data.amount <= 0) throw new AppError(400, 'Payment amount must be greater than 0');

  // Get system accounts
  const bank = await prisma.account.findFirst({ where: { name: 'Bank' } });
  const cash = await prisma.account.findFirst({ where: { name: 'Cash' } });
  const debtors = await prisma.account.findFirst({ where: { name: 'Debtors' } });
  const creditors = await prisma.account.findFirst({ where: { name: 'Creditors' } });
  const bankJournal = await prisma.journal.findFirst({ where: { type: 'bank' } });
  const cashJournal = await prisma.journal.findFirst({ where: { type: 'cash' } });

  if (!bank || !cash || !debtors || !creditors || !bankJournal || !cashJournal)
    throw new AppError(500, 'System accounts/journals not found. Please run seed.');

  const liquidAccount = data.method === 'bank' ? bank : cash;
  const paymentJournal = data.method === 'bank' ? bankJournal : cashJournal;
  const paymentDate = data.date ? new Date(data.date) : new Date();

  return prisma.$transaction(async (tx) => {
    const counter = await tx.counter.update({ where: { key: 'PAY' }, data: { seq: { increment: 1 } } });
    const paymentNumber = `PAY-${String(counter.seq).padStart(4, '0')}`;

    // Create payment record
    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        direction: data.direction,
        against: data.against,
        referenceId: data.referenceId,
        method: data.method,
        amount: data.amount,
        date: paymentDate,
      },
    });

    if (data.against === 'vendor_bill') {
      // Rule A: Debit Creditors, Credit Bank/Cash
      const bill = await tx.vendorBill.findUnique({ where: { id: data.referenceId } });
      if (!bill) throw new AppError(404, 'Vendor bill not found');

      const remaining = Number(bill.totalAmount) - Number(bill.amountPaid);
      if (data.amount > remaining + 0.001)
        throw new AppError(400, `Overpayment: remaining balance is ${remaining.toFixed(2)}`);

      await postJournalEntry(tx as typeof prisma, {
        journalId: paymentJournal.id,
        date: paymentDate,
        reference: paymentNumber,
        sourceType: 'payment',
        sourceId: payment.id,
        items: [
          { accountId: creditors.id, debit: data.amount, credit: 0 },
          { accountId: liquidAccount.id, debit: 0, credit: data.amount },
        ],
      });

      const newAmountPaid = Number(bill.amountPaid) + data.amount;
      await tx.vendorBill.update({
        where: { id: data.referenceId },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: computePaymentStatus(newAmountPaid, Number(bill.totalAmount)),
        },
      });
    } else {
      // Rule D: Debit Bank/Cash, Credit Debtors
      const invoice = await tx.customerInvoice.findUnique({ where: { id: data.referenceId } });
      if (!invoice) throw new AppError(404, 'Customer invoice not found');

      const remaining = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      if (data.amount > remaining + 0.001)
        throw new AppError(400, `Overpayment: remaining balance is ${remaining.toFixed(2)}`);

      await postJournalEntry(tx as typeof prisma, {
        journalId: paymentJournal.id,
        date: paymentDate,
        reference: paymentNumber,
        sourceType: 'payment',
        sourceId: payment.id,
        items: [
          { accountId: liquidAccount.id, debit: data.amount, credit: 0 },
          { accountId: debtors.id, debit: 0, credit: data.amount },
        ],
      });

      const newAmountPaid = Number(invoice.amountPaid) + data.amount;
      await tx.customerInvoice.update({
        where: { id: data.referenceId },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: computePaymentStatus(newAmountPaid, Number(invoice.totalAmount)),
        },
      });
    }

    return payment;
  });
};
