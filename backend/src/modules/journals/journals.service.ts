import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getJournals = async () => {
  return prisma.journal.findMany({
    include: { defaultAccount: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const createJournal = async (data: {
  name: string;
  type: 'sales' | 'purchase' | 'bank' | 'cash';
  defaultAccountId: string;
}) => {
  const account = await prisma.account.findUnique({ where: { id: data.defaultAccountId } });
  if (!account) throw new AppError(404, 'Default account not found');
  return prisma.journal.create({ data, include: { defaultAccount: true } });
};
