import axiosClient from './axiosClient';
import type { AnalyticAccount } from '../types';

export const getAnalyticAccounts = () =>
  axiosClient.get<AnalyticAccount[]>('/analytic-accounts').then((r) => r.data);

export const createAnalyticAccount = (data: { name: string; type: string }) =>
  axiosClient.post<AnalyticAccount>('/analytic-accounts', data).then((r) => r.data);
