import { ClerkAuthService } from '../infrastructure/auth/clerk.service.js';
import { upsertUser, type UserRow } from '../infrastructure/database/user.repository.js';

const clerk = new ClerkAuthService();

/**
 * Ensure the authenticated Clerk user has a row in our `users` table.
 *
 * Identity lives in Clerk; this keeps a local projection so other tables (e.g. sources)
 * can foreign-key to a user. Called on identity check (/auth/me) and before any write
 * that references the user. Idempotent (upsert).
 */
export async function ensureUserSynced(userId: string): Promise<UserRow> {
  const clerkUser = await clerk.getUser(userId);

  const primary = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);
  const email = primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error(`Clerk user ${userId} has no email address`);
  }

  return upsertUser({ id: userId, email });
}
