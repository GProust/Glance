import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { clerkAuthMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { UnauthorizedError } from '../../core/config/error-handling.js';
import { ensureUserSynced } from '../../application/user.service.js';

const authRouter = Router();

// Identity check. Also syncs the Clerk user into our `users` table on first call,
// so the local projection exists for foreign keys.
authRouter.get('/me', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) throw new UnauthorizedError();
    const user = await ensureUserSynced(userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export { authRouter };
