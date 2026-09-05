import axiosClient from './axiosClient';
import type { VendorBill } from '../types';

export const getVendorBills = () =>
  axiosClient.get<VendorBill[]>('/vendor-bills').then((r) => r.data);

export const getVendorBill = (id: string) =>
  axiosClient.get<VendorBill>(`/vendor-bills/${id}`).then((r) => r.data);
