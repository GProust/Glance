import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../core/config/env.config.js';

export class SupabaseAdapter {
  private static instance: SupabaseClient;

  private constructor() {}

  public static getInstance(): SupabaseClient {
    if (!SupabaseAdapter.instance) {
      SupabaseAdapter.instance = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY
      );
    }
    return SupabaseAdapter.instance;
  }
}
