import { Request, Response } from 'express';
import * as service from './products.service';

export const getProducts = async (req: Request, res: Response) => {
  const archived = req.query.archived === 'true';
  res.json(await service.getProducts(archived));
};

export const getProduct = async (req: Request, res: Response) => {
  res.json(await service.getProductById(req.params.id));
};

export const createProduct = async (req: Request, res: Response) => {
  res.status(201).json(await service.createProduct(req.body));
};

export const updateProduct = async (req: Request, res: Response) => {
  res.json(await service.updateProduct(req.params.id, req.body));
};

export const archiveProduct = async (req: Request, res: Response) => {
  await service.archiveProduct(req.params.id);
  res.json({ message: 'Product archived' });
};
