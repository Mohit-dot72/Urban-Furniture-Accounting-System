import { Request, Response } from 'express';
import * as service from './vendorBills.service';

export const getVendorBills = async (_req: Request, res: Response) => {
  res.json(await service.getVendorBills());
};

export const getVendorBill = async (req: Request, res: Response) => {
  res.json(await service.getVendorBillById(req.params.id));
};
