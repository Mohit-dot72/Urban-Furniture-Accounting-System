import { Router } from 'express';
import * as controller from './purchaseOrders.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

const createPOSchema = z.object({
  vendorId: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1),
});

const convertSchema = z.object({
  invoiceDate: z.string().min(1),
  dueDate: z.string().min(1),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getPurchaseOrders);
router.post('/', authorize('admin', 'accountant'), validate(createPOSchema), controller.createPurchaseOrder);
router.get('/:id', authorize('admin', 'accountant'), controller.getPurchaseOrder);
router.patch('/:id', authorize('admin', 'accountant'), controller.updatePurchaseOrder);
router.post('/:id/convert-to-bill', authorize('admin', 'accountant'), validate(convertSchema), controller.convertToBill);

export default router;
