import axiosClient from './axiosClient';
import type { Product } from '../types';

export const getProducts = (archived = false) =>
  axiosClient.get<Product[]>(`/products?archived=${archived}`).then((r) => r.data);

export const getProduct = (id: string) =>
  axiosClient.get<Product>(`/products/${id}`).then((r) => r.data);

export const createProduct = (data: Partial<Product>) =>
  axiosClient.post<Product>('/products', data).then((r) => r.data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  axiosClient.patch<Product>(`/products/${id}`, data).then((r) => r.data);

export const archiveProduct = (id: string) =>
  axiosClient.delete(`/products/${id}`).then((r) => r.data);
