import { Router } from 'express';
import * as controller from './analyticAccounts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const analyticSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['income', 'expense']),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getAnalyticAccounts);
router.post('/', authorize('admin', 'accountant'), validate(analyticSchema), controller.createAnalyticAccount);

export default router;
