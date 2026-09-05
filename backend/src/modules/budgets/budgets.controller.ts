import { Request, Response } from 'express';
import * as service from './budgets.service';

export const getBudgets = async (_req: Request, res: Response) => {
  res.json(await service.getBudgets());
};

export const createBudget = async (req: Request, res: Response) => {
  res.status(201).json(await service.createBudget(req.body));
};
