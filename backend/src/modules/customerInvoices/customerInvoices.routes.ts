import { Router } from 'express';
import * as controller from './customerInvoices.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);
// All three roles can access, but contactId filtering is done in controller from JWT
router.get('/', authorize('admin', 'accountant', 'contact'), controller.getCustomerInvoices);
router.get('/:id', authorize('admin', 'accountant', 'contact'), controller.getCustomerInvoice);

export default router;
