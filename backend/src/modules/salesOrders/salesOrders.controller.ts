import { Request, Response } from 'express';
import * as service from './salesOrders.service';

export const getSalesOrders = async (_req: Request, res: Response) => {
  res.json(await service.getSalesOrders());
};

export const getSalesOrder = async (req: Request, res: Response) => {
  res.json(await service.getSalesOrderById(req.params.id));
};

export const createSalesOrder = async (req: Request, res: Response) => {
  res.status(201).json(await service.createSalesOrder(req.body));
};

export const updateSalesOrder = async (req: Request, res: Response) => {
  res.json(await service.updateSalesOrder(req.params.id, req.body));
};

export const convertToInvoice = async (req: Request, res: Response) => {
  const { invoiceDate, dueDate } = req.body;
  res.status(201).json(await service.convertToInvoice(req.params.id, invoiceDate, dueDate));
};
