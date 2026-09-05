import { Request, Response } from 'express';
import * as service from './accounts.service';

export const getAccounts = async (_req: Request, res: Response) => {
  res.json(await service.getAccounts());
};

export const createAccount = async (req: Request, res: Response) => {
  res.status(201).json(await service.createAccount(req.body));
};

export const updateAccount = async (req: Request, res: Response) => {
  res.json(await service.updateAccount(req.params.id, req.body));
};

export const deleteAccount = async (req: Request, res: Response) => {
  await service.deleteAccount(req.params.id);
  res.json({ message: 'Account deleted' });
};
