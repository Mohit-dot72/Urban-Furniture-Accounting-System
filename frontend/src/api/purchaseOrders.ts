import axiosClient from './axiosClient';
import type { PurchaseOrder } from '../types';

export const getPurchaseOrders = () =>
  axiosClient.get<PurchaseOrder[]>('/purchase-orders').then((r) => r.data);

export const getPurchaseOrder = (id: string) =>
  axiosClient.get<PurchaseOrder>(`/purchase-orders/${id}`).then((r) => r.data);

export const createPurchaseOrder = (data: {
  vendorId: string;
  lineItems: { productId: string; quantity: number; unitPrice: number }[];
}) => axiosClient.post<PurchaseOrder>('/purchase-orders', data).then((r) => r.data);

export const updatePurchaseOrder = (id: string, data: { status: string }) =>
  axiosClient.patch<PurchaseOrder>(`/purchase-orders/${id}`, data).then((r) => r.data);

export const convertToBill = (id: string, data: { invoiceDate: string; dueDate: string }) =>
  axiosClient.post(`/purchase-orders/${id}/convert-to-bill`, data).then((r) => r.data);
