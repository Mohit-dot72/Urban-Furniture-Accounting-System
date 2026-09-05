import { prisma } from '../prisma';

interface AccountLineItem {
  accountId: string;
  accountName: string;
  amount: number;
}

interface ProfitAndLossResult {
  income: AccountLineItem[];
  expenses: AccountLineItem[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export const computeProfitAndLoss = async (
  start: Date,
  end: Date
): Promise<ProfitAndLossResult> => {
  const accounts = await prisma.account.findMany({
    where: {
      type: { in: ['income', 'expense'] },
    },
    include: {
      journalEntryItems: {
        include: { journalEntry: true },
        where: {
          journalEntry: {
            date: { gte: start, lte: end },
          },
        },
      },
    },
  });

  const income: AccountLineItem[] = [];
  const expenses: AccountLineItem[] = [];

  for (const account of accounts) {
    const totalDebit = account.journalEntryItems.reduce((s, i) => s + Number(i.debit), 0);
    const totalCredit = account.journalEntryItems.reduce((s, i) => s + Number(i.credit), 0);

    const entry: AccountLineItem = {
      accountId: account.id,
      accountName: account.name,
      amount: account.type === 'income' ? totalCredit - totalDebit : totalDebit - totalCredit,
    };

    if (account.type === 'income') income.push(entry);
    else expenses.push(entry);
  }

  const totalIncome = income.reduce((s, a) => s + a.amount, 0);
  const totalExpenses = expenses.reduce((s, a) => s + a.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return { income, expenses, totalIncome, totalExpenses, netProfit };
};
