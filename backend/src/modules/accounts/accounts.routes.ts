import { Router } from 'express';
import * as controller from './accounts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const accountSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['asset', 'liability', 'expense', 'income', 'capital']),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getAccounts);
router.post('/', authorize('admin', 'accountant'), validate(accountSchema), controller.createAccount);
router.patch('/:id', authorize('admin', 'accountant'), controller.updateAccount);
router.delete('/:id', authorize('admin'), controller.deleteAccount);

export default router;
