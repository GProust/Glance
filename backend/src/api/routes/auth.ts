import { Router } from 'express';
import { clerkAuthMiddleware } from '../middleware/auth.js';

const authRouter = Router();

authRouter.get('/me', clerkAuthMiddleware, (req, res) => {
  res.json({
    user: (req as any).auth,
  });
});

export { authRouter };
