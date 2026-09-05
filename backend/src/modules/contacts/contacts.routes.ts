import { Router } from 'express';
import * as controller from './contacts.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const contactSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['customer', 'vendor', 'both']),
  email: z.string().email(),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits'),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
});

router.use(authenticate);

router.get('/', authorize('admin', 'accountant'), controller.getContacts);
router.post('/', authorize('admin', 'accountant'), validate(contactSchema), controller.createContact);
router.get('/:id', authorize('admin', 'accountant'), controller.getContact);
router.patch('/:id', authorize('admin', 'accountant'), controller.updateContact);
router.delete('/:id', authorize('admin'), controller.archiveContact);
router.post('/:id/upload-image', authorize('admin', 'accountant'), upload.single('image'), controller.uploadImage);

export default router;
