import axiosClient from './axiosClient';
import type { CustomerInvoice } from '../types';

export const getCustomerInvoices = (contactId?: string) => {
  const params = contactId ? `?contactId=${contactId}` : '';
  return axiosClient.get<CustomerInvoice[]>(`/customer-invoices${params}`).then((r) => r.data);
};

export const getCustomerInvoice = (id: string) =>
  axiosClient.get<CustomerInvoice>(`/customer-invoices/${id}`).then((r) => r.data);
