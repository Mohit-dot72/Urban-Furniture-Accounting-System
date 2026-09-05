import { Request, Response } from 'express';
import * as service from './customerInvoices.service';

export const getCustomerInvoices = async (req: Request, res: Response) => {
  // Contact role: always filter by own contactId (from JWT)
  const user = req.user!;
  const contactId = user.role === 'contact' ? user.contactId ?? undefined : (req.query.contactId as string | undefined);
  res.json(await service.getCustomerInvoices(contactId));
};

export const getCustomerInvoice = async (req: Request, res: Response) => {
  const user = req.user!;
  const forContactId = user.role === 'contact' ? user.contactId ?? undefined : undefined;
  res.json(await service.getCustomerInvoiceById(req.params.id, forContactId));
};
