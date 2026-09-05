import { Router } from 'express';
import * as controller from './journals.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const journalSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['sales', 'purchase', 'bank', 'cash']),
  defaultAccountId: z.string().min(1),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getJournals);
router.post('/', authorize('admin', 'accountant'), validate(journalSchema), controller.createJournal);

export default router;
