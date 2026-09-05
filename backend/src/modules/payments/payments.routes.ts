import { Router } from 'express';
import * as controller from './payments.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const paymentSchema = z.object({
  direction: z.enum(['incoming', 'outgoing']),
  against: z.enum(['vendor_bill', 'customer_invoice']),
  referenceId: z.string().min(1),
  method: z.enum(['cash', 'bank']),
  amount: z.number().positive(),
  date: z.string().optional(),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getPayments);
router.get('/:id', authorize('admin', 'accountant'), controller.getPayment);
// Contact role can create payment on their own invoice
router.post('/', authorize('admin', 'accountant', 'contact'), validate(paymentSchema), controller.createPayment);

export default router;
