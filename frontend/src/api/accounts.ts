import axiosClient from './axiosClient';
import type { Account } from '../types';

export const getAccounts = () =>
  axiosClient.get<Account[]>('/accounts').then((r) => r.data);

export const createAccount = (data: { name: string; type: string }) =>
  axiosClient.post<Account>('/accounts', data).then((r) => r.data);

export const updateAccount = (id: string, data: Partial<Account>) =>
  axiosClient.patch<Account>(`/accounts/${id}`, data).then((r) => r.data);

export const deleteAccount = (id: string) =>
  axiosClient.delete(`/accounts/${id}`).then((r) => r.data);
