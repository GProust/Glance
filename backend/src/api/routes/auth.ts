import { Router } from 'express';
import { clerkAuthMiddleware, AuthRequest } from '../middleware/auth.js';

const authRouter = Router();

authRouter.get('/me', clerkAuthMiddleware, (req: AuthRequest, res) => {
  res.json({
    user: req.auth,
  });
});

export { authRouter };
