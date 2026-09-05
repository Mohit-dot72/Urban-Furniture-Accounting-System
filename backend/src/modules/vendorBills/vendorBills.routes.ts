import { Router } from 'express';
import * as controller from './vendorBills.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getVendorBills);
router.get('/:id', authorize('admin', 'accountant'), controller.getVendorBill);

export default router;
