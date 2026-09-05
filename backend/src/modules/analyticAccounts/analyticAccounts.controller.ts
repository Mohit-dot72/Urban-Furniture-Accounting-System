import { Request, Response } from 'express';
import * as service from './analyticAccounts.service';

export const getAnalyticAccounts = async (_req: Request, res: Response) => {
  res.json(await service.getAnalyticAccounts());
};

export const createAnalyticAccount = async (req: Request, res: Response) => {
  res.status(201).json(await service.createAnalyticAccount(req.body));
};
