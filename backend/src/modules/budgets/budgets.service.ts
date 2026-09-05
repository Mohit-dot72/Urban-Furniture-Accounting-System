import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getBudgets = async () => {
  return prisma.budget.findMany({
    include: { analyticAccount: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const createBudget = async (data: {
  name: string;
  startDate: string;
  endDate: string;
  responsiblePerson: string;
  plannedAmount: number;
  analyticAccountId: string;
}) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (end < start) throw new AppError(400, 'endDate must be >= startDate');

  const analyticAccount = await prisma.analyticAccount.findUnique({ where: { id: data.analyticAccountId } });
  if (!analyticAccount) throw new AppError(404, 'Analytic account not found');

  return prisma.budget.create({
    data: {
      name: data.name,
      startDate: start,
      endDate: end,
      responsiblePerson: data.responsiblePerson,
      plannedAmount: data.plannedAmount,
      analyticAccountId: data.analyticAccountId,
    },
    include: { analyticAccount: true },
  });
};
