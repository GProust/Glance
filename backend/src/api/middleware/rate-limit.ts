import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import type { Response, NextFunction } from 'express';
import { env } from '../../core/config/env.config.js';
import { RateLimitError } from '../../core/config/error-handling.js';
import type { AuthRequest } from './auth.js';

// Rate limiting is enabled only when both Upstash values are present. In local dev
// without them, the middleware becomes a no-op so the backend still runs.
const ratelimit =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        }),
        // 100 requests per minute, sliding window.
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit',
      })
    : null;

if (!ratelimit) {
  console.warn('[rate-limit] Upstash not configured — rate limiting is DISABLED.');
}

export async function rateLimitMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!ratelimit) {
    next();
    return;
  }

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
