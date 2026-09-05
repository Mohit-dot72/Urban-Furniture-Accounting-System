import axiosClient from './axiosClient';
import type { Journal } from '../types';

export const getJournals = () =>
  axiosClient.get<Journal[]>('/journals').then((r) => r.data);

export const createJournal = (data: { name: string; type: string; defaultAccountId: string }) =>
  axiosClient.post<Journal>('/journals', data).then((r) => r.data);
