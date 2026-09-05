import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getProducts = async (archived = false) => {
  return prisma.product.findMany({
    where: { isArchived: archived },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');
  return product;
};

export const createProduct = async (data: {
  name: string;
  type: 'goods' | 'service' | 'combo';
  salesPrice: number;
  costPrice: number;
  category?: string;
}) => {
  return prisma.product.create({ data });
};

export const updateProduct = async (id: string, data: Partial<{
  name: string;
  type: 'goods' | 'service' | 'combo';
  salesPrice: number;
  costPrice: number;
  category: string;
}>) => {
  await getProductById(id);
  return prisma.product.update({ where: { id }, data });
};

export const archiveProduct = async (id: string) => {
  await getProductById(id);
  return prisma.product.update({ where: { id }, data: { isArchived: true } });
};
