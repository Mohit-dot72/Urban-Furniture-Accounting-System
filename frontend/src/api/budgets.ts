import axiosClient from './axiosClient';
import type { Budget } from '../types';

export const getBudgets = () =>
  axiosClient.get<Budget[]>('/budgets').then((r) => r.data);

export const createBudget = (data: {
  name: string;
  startDate: string;
  endDate: string;
  responsiblePerson: string;
  plannedAmount: number;
  analyticAccountId: string;
}) => axiosClient.post<Budget>('/budgets', data).then((r) => r.data);
