import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getAccounts = async () => {
  return prisma.account.findMany({ orderBy: { type: 'asc' } });
};

export const getAccountById = async (id: string) => {
  const acc = await prisma.account.findUnique({ where: { id } });
  if (!acc) throw new AppError(404, 'Account not found');
  return acc;
};

export const createAccount = async (data: {
  name: string;
  type: 'asset' | 'liability' | 'expense' | 'income' | 'capital';
}) => {
  return prisma.account.create({ data });
};

export const updateAccount = async (id: string, data: Partial<{ name: string; type: string }>) => {
  const acc = await getAccountById(id);
  if (acc.isSystemDefault) throw new AppError(403, 'Cannot modify a system default account');
  return prisma.account.update({ where: { id }, data });
};

export const deleteAccount = async (id: string) => {
  const acc = await getAccountById(id);
  if (acc.isSystemDefault) throw new AppError(403, 'Cannot delete a system default account');
  return prisma.account.delete({ where: { id } });
};
