import { Request, Response } from 'express';
import * as service from './journals.service';

export const getJournals = async (_req: Request, res: Response) => {
  res.json(await service.getJournals());
};

export const createJournal = async (req: Request, res: Response) => {
  res.status(201).json(await service.createJournal(req.body));
};
