import { prisma } from '../prisma';
import { AccountType } from '@prisma/client';

interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
}

interface BalanceSheetResult {
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  capital: AccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalCapital: number;
  isBalanced: boolean;
}

export const computeBalanceSheet = async (asOf: Date): Promise<BalanceSheetResult> => {
  const accounts = await prisma.account.findMany({
    include: {
      journalEntryItems: {
        include: {
          journalEntry: true,
        },
        where: {
          journalEntry: {
            date: { lte: asOf },
          },
        },
      },
    },
  });

  const categorize = (type: AccountType, items: { debit: unknown; credit: unknown }[]): number => {
    const totalDebit = items.reduce((s, i) => s + Number(i.debit), 0);
    const totalCredit = items.reduce((s, i) => s + Number(i.credit), 0);

    if (type === 'asset') return totalDebit - totalCredit;
    if (type === 'liability') return totalCredit - totalDebit;
    if (type === 'capital') return totalCredit - totalDebit;
    if (type === 'income') return totalCredit - totalDebit;
    if (type === 'expense') return totalDebit - totalCredit;
    return 0;
  };

  const assets: AccountBalance[] = [];
  const liabilities: AccountBalance[] = [];
  const capital: AccountBalance[] = [];

  for (const account of accounts) {
    const balance = categorize(account.type, account.journalEntryItems);
    const entry: AccountBalance = {
      accountId: account.id,
      accountName: account.name,
      balance,
    };

    if (account.type === 'asset') assets.push(entry);
    else if (account.type === 'liability') liabilities.push(entry);
    else if (account.type === 'capital') capital.push(entry);
    // income/expense accounts contribute to retained earnings
    else if (account.type === 'income' || account.type === 'expense') {
      capital.push({
        ...entry,
        accountName: `${account.name} (Net)`,
        balance: account.type === 'income' ? balance : -balance,
      });
    }
  }

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const totalCapital = capital.reduce((s, a) => s + a.balance, 0);
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 0.01;

  if (!isBalanced) {
    console.warn(
      `[BalanceSheet WARNING] Assets (${totalAssets.toFixed(2)}) ≠ Liabilities + Capital (${(totalLiabilities + totalCapital).toFixed(2)})`
    );
  }

  return {
    assets,
    liabilities,
    capital,
    totalAssets,
    totalLiabilities,
    totalCapital,
    isBalanced,
  };
};
