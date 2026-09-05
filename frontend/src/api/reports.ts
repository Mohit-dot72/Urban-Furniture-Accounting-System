import axiosClient from './axiosClient';
import type { BalanceSheetReport, ProfitAndLossReport, BudgetReportLine } from '../types';

export const getBalanceSheet = (asOf: string) =>
  axiosClient.get<BalanceSheetReport>(`/reports/balance-sheet?asOf=${asOf}`).then((r) => r.data);

export const getProfitAndLoss = (start: string, end: string) =>
  axiosClient.get<ProfitAndLossReport>(`/reports/profit-and-loss?start=${start}&end=${end}`).then((r) => r.data);

export const getBudgetReport = (start?: string, end?: string) => {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  return axiosClient.get<BudgetReportLine[]>(`/reports/budget-report?${params.toString()}`).then((r) => r.data);
};
