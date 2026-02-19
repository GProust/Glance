import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { Response, NextFunction } from 'express';
import { env } from '../../core/config/env.config.js';
import { RateLimitError } from '../../core/config/error-handling.js';
import { AuthRequest } from './auth.js';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Create a new ratelimiter, that allows 100 requests per 1 minute
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

export async function rateLimitMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const identifier = req.auth?.userId || req.ip || 'anonymous';
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      throw new RateLimitError();
    }

    next();
  } catch (error) {
    next(error);
  }
}
