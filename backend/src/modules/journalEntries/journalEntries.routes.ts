import { Router } from 'express';
import * as controller from './journalEntries.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const manualEntrySchema = z.object({
  journalId: z.string().min(1),
  date: z.string().optional(),
  reference: z.string().optional(),
  items: z.array(z.object({
    accountId: z.string().min(1),
    debit: z.number().min(0),
    credit: z.number().min(0),
    analyticAccountId: z.string().optional(),
  })).min(2),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getJournalEntries);
router.get('/:id', authorize('admin', 'accountant'), controller.getJournalEntry);
router.post('/', authorize('admin', 'accountant'), validate(manualEntrySchema), controller.createJournalEntry);

export default router;
