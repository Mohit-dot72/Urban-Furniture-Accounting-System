import { Router } from 'express';
import * as controller from './reports.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
router.get('/balance-sheet', authorize('admin', 'accountant'), controller.getBalanceSheet);
router.get('/profit-and-loss', authorize('admin', 'accountant'), controller.getProfitAndLoss);
router.get('/budget-report', authorize('admin', 'accountant'), controller.getBudgetReport);

export default router;
