import { prisma } from '../../lib/prisma';

export const getAnalyticAccounts = async () => {
  return prisma.analyticAccount.findMany({ orderBy: { createdAt: 'desc' } });
};

export const createAnalyticAccount = async (data: { name: string; type: 'income' | 'expense' }) => {
  return prisma.analyticAccount.create({ data });
};
