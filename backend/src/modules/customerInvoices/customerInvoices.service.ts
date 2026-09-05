import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getCustomerInvoices = async (contactId?: string) => {
  return prisma.customerInvoice.findMany({
    where: contactId ? { customerId: contactId } : undefined,
    include: { customer: true, lineItems: true, salesOrder: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getCustomerInvoiceById = async (id: string, forContactId?: string) => {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: true, salesOrder: true },
  });
  if (!invoice) throw new AppError(404, 'Customer invoice not found');
  // Enforce contact scoping server-side
  if (forContactId && invoice.customerId !== forContactId) {
    throw new AppError(403, 'Forbidden: you can only view your own invoices');
  }
  return invoice;
};
