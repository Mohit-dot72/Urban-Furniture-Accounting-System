import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getVendorBills = async () => {
  return prisma.vendorBill.findMany({
    include: { vendor: true, lineItems: true, purchaseOrder: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getVendorBillById = async (id: string) => {
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: { vendor: true, lineItems: true, purchaseOrder: true },
  });
  if (!bill) throw new AppError(404, 'Vendor bill not found');
  return bill;
};
