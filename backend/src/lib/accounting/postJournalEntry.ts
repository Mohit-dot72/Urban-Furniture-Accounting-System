import { PrismaClient, SourceType } from '@prisma/client';
import { AccountingError } from '../../middleware/errorHandler';

interface JournalEntryItem {
  accountId: string;
  debit: number;
  credit: number;
  analyticAccountId?: string;
}

interface PostJournalEntryInput {
  journalId: string;
  date?: Date;
  reference?: string;
  sourceType: SourceType;
  sourceId?: string;
  items: JournalEntryItem[];
}

export const postJournalEntry = async (
  prisma: PrismaClient,
  input: PostJournalEntryInput
) => {
  const { journalId, date, reference, sourceType, sourceId, items } = input;

  // Validate debit === credit
  const totalDebit = items.reduce((sum, i) => sum + i.debit, 0);
  const totalCredit = items.reduce((sum, i) => sum + i.credit, 0);

  // Use toFixed to avoid floating point issues
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new AccountingError(
      `Journal entry imbalanced: total debit (${totalDebit.toFixed(2)}) ≠ total credit (${totalCredit.toFixed(2)})`
    );
  }

  const entry = await prisma.journalEntry.create({
    data: {
      journalId,
      date: date ?? new Date(),
      reference,
      sourceType,
      sourceId,
      items: {
        create: items.map((item) => ({
          accountId: item.accountId,
          debit: item.debit,
          credit: item.credit,
          analyticAccountId: item.analyticAccountId,
        })),
      },
    },
    include: {
      items: {
        include: {
          account: true,
          analyticAccount: true,
        },
      },
      journal: true,
    },
  });

  return entry;
};
