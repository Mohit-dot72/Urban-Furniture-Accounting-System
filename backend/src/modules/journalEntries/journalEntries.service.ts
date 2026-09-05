import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getJournalEntries = async () => {
  return prisma.journalEntry.findMany({
    include: {
      journal: true,
      items: { include: { account: true, analyticAccount: true } },
    },
    orderBy: { date: 'desc' },
  });
};

export const getJournalEntryById = async (id: string) => {
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      journal: true,
      items: { include: { account: true, analyticAccount: true } },
    },
  });
  if (!entry) throw new AppError(404, 'Journal entry not found');
  return entry;
};

export const createManualJournalEntry = async (data: {
  journalId: string;
  date?: string;
  reference?: string;
  items: { accountId: string; debit: number; credit: number; analyticAccountId?: string }[];
}) => {
  const { postJournalEntry } = await import('../../lib/accounting/postJournalEntry');
  const { prisma: p } = await import('../../lib/prisma');
  return postJournalEntry(p, {
    journalId: data.journalId,
    date: data.date ? new Date(data.date) : undefined,
    reference: data.reference,
    sourceType: 'manual',
    items: data.items,
  });
};
