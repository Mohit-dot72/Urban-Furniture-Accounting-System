import { Router } from 'express';
import * as controller from './salesOrders.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100).optional(),
});

const createSOSchema = z.object({
  customerId: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1),
});

const convertSchema = z.object({
  invoiceDate: z.string().min(1),
  dueDate: z.string().min(1),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getSalesOrders);
router.post('/', authorize('admin', 'accountant'), validate(createSOSchema), controller.createSalesOrder);
router.get('/:id', authorize('admin', 'accountant'), controller.getSalesOrder);
router.patch('/:id', authorize('admin', 'accountant'), controller.updateSalesOrder);
router.post('/:id/convert-to-invoice', authorize('admin', 'accountant'), validate(convertSchema), controller.convertToInvoice);

export default router;
