import { createClerkClient } from '@clerk/backend';
import { env } from '../../core/config/env.config.js';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export class ClerkAuthService {
  public async getUser(userId: string) {
    return await clerkClient.users.getUser(userId);
  }

  public async verifyToken(token: string) {
    return await clerkClient.authenticateRequest({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    });
  }
}
