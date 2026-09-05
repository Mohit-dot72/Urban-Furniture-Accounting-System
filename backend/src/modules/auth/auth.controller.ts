import { Request, Response } from 'express';
import { loginService, registerService } from './auth.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginService(email, password);
  res.json(result);
};

export const register = async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  res.status(201).json(result);
};
