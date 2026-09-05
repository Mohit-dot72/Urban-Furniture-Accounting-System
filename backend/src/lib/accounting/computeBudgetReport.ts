import { prisma } from '../prisma';

interface BudgetReportLine {
  budgetId: string;
  budgetName: string;
  analyticAccountId: string;
  analyticAccountName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  percentUsed: number;
  startDate: Date;
  endDate: Date;
}

export const computeBudgetReport = async (
  start?: Date,
  end?: Date
): Promise<BudgetReportLine[]> => {
  const budgets = await prisma.budget.findMany({
    include: {
      analyticAccount: {
        include: {
          journalEntryItems: {
            include: { journalEntry: true },
          },
        },
      },
    },
  });

  return budgets.map((budget) => {
    const periodStart = start ?? budget.startDate;
    const periodEnd = end ?? budget.endDate;

    const actualAmount = budget.analyticAccount.journalEntryItems
      .filter((item) => {
        const entryDate = item.journalEntry.date;
        return entryDate >= periodStart && entryDate <= periodEnd;
      })
      .reduce((sum, item) => {
        // For expense analytic accounts, sum debits; for income, sum credits
        if (budget.analyticAccount.type === 'expense') {
          return sum + Number(item.debit);
        }
        return sum + Number(item.credit);
      }, 0);

    const plannedAmount = Number(budget.plannedAmount);
    const variance = plannedAmount - actualAmount;
    const percentUsed = plannedAmount > 0 ? (actualAmount / plannedAmount) * 100 : 0;

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      analyticAccountId: budget.analyticAccountId,
      analyticAccountName: budget.analyticAccount.name,
      plannedAmount,
      actualAmount,
      variance,
      percentUsed: Math.round(percentUsed * 100) / 100,
      startDate: budget.startDate,
      endDate: budget.endDate,
    };
  });
};
