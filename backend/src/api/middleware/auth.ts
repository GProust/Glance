import { createClerkClient } from '@clerk/backend';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../../core/config/env.config.js';
import { UnauthorizedError } from '../../core/config/error-handling.js';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export interface AuthData {
  userId: string | null;
  [key: string]: unknown;
}

export interface AuthRequest extends Request {
  auth?: AuthData;
}

export async function clerkAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];

    if (!sessionToken) {
      throw new UnauthorizedError('No session token provided');
    }

    // Use any cast for clerk internal request type compatibility if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestState = await clerkClient.authenticateRequest(req as any);

    if (requestState.isSignedIn === false) {
      throw new UnauthorizedError('Invalid session token');
    }

    // Attach auth data to request object
    (req as AuthRequest).auth = requestState.toAuth() as unknown as AuthData;

    next();
  } catch (error) {
    next(error);
  }
}
