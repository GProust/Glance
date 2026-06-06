import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { clerkAuthMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { NotFoundError, UnauthorizedError } from '../../core/config/error-handling.js';
import { listFeedForUser, getFeedItemForUser } from '../../infrastructure/database/content.repository.js';

const feedRouter = Router();

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/** GET /api/v1/feed — the read-only aggregated feed for the authenticated user. */
feedRouter.get('/', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) throw new UnauthorizedError();

    const limit = Math.min(Math.max(Number(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const items = await listFeedForUser(userId, { limit, offset });
    res.json({ items, limit, offset });
  } catch (error) {
    next(error);
  }
});

/** GET /api/v1/feed/:id — detail view of a single owned feed item. */
feedRouter.get('/:id', clerkAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) throw new UnauthorizedError();

    const item = await getFeedItemForUser(userId, String(req.params.id));
    if (!item) throw new NotFoundError('Feed item not found');
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export { feedRouter };
