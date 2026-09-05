import { Request, Response } from 'express';
import * as service from './payments.service';

export const getPayments = async (_req: Request, res: Response) => {
  res.json(await service.getPayments());
};

export const getPayment = async (req: Request, res: Response) => {
  res.json(await service.getPaymentById(req.params.id));
};

export const createPayment = async (req: Request, res: Response) => {
  res.status(201).json(await service.createPayment(req.body));
};
