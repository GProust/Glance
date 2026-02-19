import { Router } from 'express';
import type { Response } from 'express';
import { clerkAuthMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const authRouter = Router();

authRouter.get('/me', clerkAuthMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    user: req.auth,
  });
});

export { authRouter };
