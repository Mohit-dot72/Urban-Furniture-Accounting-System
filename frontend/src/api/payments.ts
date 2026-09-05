import axiosClient from './axiosClient';
import type { Payment } from '../types';

export const getPayments = () =>
  axiosClient.get<Payment[]>('/payments').then((r) => r.data);

export const getPayment = (id: string) =>
  axiosClient.get<Payment>(`/payments/${id}`).then((r) => r.data);

export const createPayment = (data: {
  direction: string;
  against: string;
  referenceId: string;
  method: string;
  amount: number;
  date?: string;
}) => axiosClient.post<Payment>('/payments', data).then((r) => r.data);
