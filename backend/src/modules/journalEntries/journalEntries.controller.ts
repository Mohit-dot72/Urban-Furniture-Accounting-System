import { Request, Response } from 'express';
import * as service from './journalEntries.service';

export const getJournalEntries = async (_req: Request, res: Response) => {
  res.json(await service.getJournalEntries());
};

export const getJournalEntry = async (req: Request, res: Response) => {
  res.json(await service.getJournalEntryById(req.params.id));
};

export const createJournalEntry = async (req: Request, res: Response) => {
  res.status(201).json(await service.createManualJournalEntry(req.body));
};
