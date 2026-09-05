import axiosClient from './axiosClient';
import type { Contact } from '../types';

export const getContacts = (archived = false) =>
  axiosClient.get<Contact[]>(`/contacts?archived=${archived}`).then((r) => r.data);

export const getContact = (id: string) =>
  axiosClient.get<Contact>(`/contacts/${id}`).then((r) => r.data);

export const createContact = (data: Partial<Contact>) =>
  axiosClient.post<Contact>('/contacts', data).then((r) => r.data);

export const updateContact = (id: string, data: Partial<Contact>) =>
  axiosClient.patch<Contact>(`/contacts/${id}`, data).then((r) => r.data);

export const archiveContact = (id: string) =>
  axiosClient.delete(`/contacts/${id}`).then((r) => r.data);

export const uploadContactImage = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosClient
    .post<{ profileImageUrl: string }>(`/contacts/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
