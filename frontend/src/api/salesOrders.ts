import axiosClient from './axiosClient';
import type { SalesOrder } from '../types';

export const getSalesOrders = () =>
  axiosClient.get<SalesOrder[]>('/sales-orders').then((r) => r.data);

export const getSalesOrder = (id: string) =>
  axiosClient.get<SalesOrder>(`/sales-orders/${id}`).then((r) => r.data);

export const createSalesOrder = (data: {
  customerId: string;
  lineItems: { productId: string; quantity: number; unitPrice: number; taxRate?: number }[];
}) => axiosClient.post<SalesOrder>('/sales-orders', data).then((r) => r.data);

export const updateSalesOrder = (id: string, data: { status: string }) =>
  axiosClient.patch<SalesOrder>(`/sales-orders/${id}`, data).then((r) => r.data);

export const convertToInvoice = (id: string, data: { invoiceDate: string; dueDate: string }) =>
  axiosClient.post(`/sales-orders/${id}/convert-to-invoice`, data).then((r) => r.data);
