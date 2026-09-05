import { Router } from 'express';
import * as controller from './products.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['goods', 'service', 'combo']),
  salesPrice: z.number().min(0),
  costPrice: z.number().min(0),
  category: z.string().optional(),
});

router.use(authenticate);
router.get('/', authorize('admin', 'accountant'), controller.getProducts);
router.post('/', authorize('admin', 'accountant'), validate(productSchema), controller.createProduct);
router.get('/:id', authorize('admin', 'accountant'), controller.getProduct);
router.patch('/:id', authorize('admin', 'accountant'), controller.updateProduct);
router.delete('/:id', authorize('admin'), controller.archiveProduct);

export default router;
