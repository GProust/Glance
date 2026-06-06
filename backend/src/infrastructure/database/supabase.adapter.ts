import { createClient } from '@supabase/supabase-js';
import { env } from '../../core/config/env.config.js';

/**
 * Server-side Supabase client.
 *
 * Uses the service-role key (bypasses Row Level Security) because the backend is the
 * trusted tier: it validates the Clerk JWT and scopes every query to the authenticated
 * user itself. Targets the `api` schema, which is the only schema this project exposes.
 */
function createApiClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'api' },
  });
}

export type ApiSupabaseClient = ReturnType<typeof createApiClient>;

export class SupabaseAdapter {
  private static instance: ApiSupabaseClient | undefined;

  private constructor() {}

  public static getInstance(): ApiSupabaseClient {
    if (!SupabaseAdapter.instance) {
      SupabaseAdapter.instance = createApiClient();
    }
    return SupabaseAdapter.instance;
  }
}
