import { createClerkClient } from '@clerk/backend';
import { env } from '../../core/config/env.config.js';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export class ClerkAuthService {
  public async getUser(userId: string) {
    return await clerkClient.users.getUser(userId);
  }

  public verifyToken(token: string): ReturnType<typeof clerkClient.authenticateRequest> {
    return clerkClient.authenticateRequest(
      new Request('http://localhost', {
        headers: { authorization: `Bearer ${token}` },
      })
    );
  }
}
