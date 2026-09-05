import { Request, Response } from 'express';
import * as service from './purchaseOrders.service';

export const getPurchaseOrders = async (_req: Request, res: Response) => {
  res.json(await service.getPurchaseOrders());
};

export const getPurchaseOrder = async (req: Request, res: Response) => {
  res.json(await service.getPurchaseOrderById(req.params.id));
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  res.status(201).json(await service.createPurchaseOrder(req.body));
};

export const updatePurchaseOrder = async (req: Request, res: Response) => {
  res.json(await service.updatePurchaseOrder(req.params.id, req.body));
};

export const convertToBill = async (req: Request, res: Response) => {
  const { invoiceDate, dueDate } = req.body;
  res.status(201).json(await service.convertToBill(req.params.id, invoiceDate, dueDate));
};
