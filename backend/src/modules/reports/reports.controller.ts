import { Request, Response } from 'express';
import { computeBalanceSheet } from '../../lib/accounting/computeBalanceSheet';
import { computeProfitAndLoss } from '../../lib/accounting/computeProfitAndLoss';
import { computeBudgetReport } from '../../lib/accounting/computeBudgetReport';
import { AppError } from '../../middleware/errorHandler';

export const getBalanceSheet = async (req: Request, res: Response) => {
  const asOfStr = req.query.asOf as string | undefined;
  const asOf = asOfStr ? new Date(asOfStr) : new Date();
  if (isNaN(asOf.getTime())) throw new AppError(400, 'Invalid asOf date');
  res.json(await computeBalanceSheet(asOf));
};

export const getProfitAndLoss = async (req: Request, res: Response) => {
  const { start, end } = req.query as { start?: string; end?: string };
  if (!start || !end) throw new AppError(400, 'start and end query params required');
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    throw new AppError(400, 'Invalid date format');
  res.json(await computeProfitAndLoss(startDate, endDate));
};

export const getBudgetReport = async (req: Request, res: Response) => {
  const { start, end } = req.query as { start?: string; end?: string };
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;
  res.json(await computeBudgetReport(startDate, endDate));
};
