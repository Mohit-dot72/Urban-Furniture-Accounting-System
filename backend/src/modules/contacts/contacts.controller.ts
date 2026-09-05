import { Request, Response } from 'express';
import * as service from './contacts.service';

export const getContacts = async (req: Request, res: Response) => {
  const archived = req.query.archived === 'true';
  res.json(await service.getContacts(archived));
};

export const getContact = async (req: Request, res: Response) => {
  res.json(await service.getContactById(req.params.id));
};

export const createContact = async (req: Request, res: Response) => {
  res.status(201).json(await service.createContact(req.body));
};

export const updateContact = async (req: Request, res: Response) => {
  res.json(await service.updateContact(req.params.id, req.body));
};

export const archiveContact = async (req: Request, res: Response) => {
  await service.archiveContact(req.params.id);
  res.json({ message: 'Contact archived' });
};

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const url = await service.uploadContactImage(req.params.id, req.file.buffer, req.file.mimetype);
  res.json({ profileImageUrl: url });
};
