import { Router } from 'express';
import { login, register } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['accountant', 'contact']),
  contactId: z.string().optional(),
});

router.post('/login', validate(loginSchema), login);
router.post('/register', authenticate, authorize('admin'), validate(registerSchema), register);

export default router;
