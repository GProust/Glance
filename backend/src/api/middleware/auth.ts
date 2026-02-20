import { createClerkClient } from '@clerk/backend';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../core/config/env.config.js';
import { UnauthorizedError } from '../../core/config/error-handling.js';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export interface AuthRequest extends Request {
  auth?: any;
}

export async function clerkAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];

    if (!sessionToken) {
      throw new UnauthorizedError('No session token provided');
    }

    const requestState = await clerkClient.authenticateRequest(req);

    if (requestState.isSignedIn === false) {
      throw new UnauthorizedError('Invalid session token');
    }

    // Attach auth data to request object
    (req as AuthRequest).auth = requestState.toAuth();

    next();
  } catch (error) {
    next(error);
  }
}
