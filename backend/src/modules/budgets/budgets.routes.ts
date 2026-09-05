import { Router } from 'express';
import * as controller from './budgets.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const budgetSchema = z.object({
  name: z.string().trim().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  responsiblePerson: z.string().trim().min(1),
  plannedAmount: z.number().min(0),
  analyticAccountId: z.string().min(1),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getBudgets);
router.post('/', authorize('admin', 'accountant'), validate(budgetSchema), controller.createBudget);

export default router;
