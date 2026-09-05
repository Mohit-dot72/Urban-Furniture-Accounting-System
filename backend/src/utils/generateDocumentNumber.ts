import { prisma } from '../lib/prisma';

export const generateDocumentNumber = async (
  key: string,
  prefix: string
): Promise<string> => {
  const counter = await prisma.counter.update({
    where: { key },
    data: { seq: { increment: 1 } },
  });
  return `${prefix}-${String(counter.seq).padStart(4, '0')}`;
};
