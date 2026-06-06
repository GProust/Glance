import { SupabaseAdapter } from './supabase.adapter.js';

export interface UserRow {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/** Insert or update the local projection of a Clerk user (keyed by Clerk id). */
export async function upsertUser(user: { id: string; email: string }): Promise<UserRow> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('users')
    .upsert({ id: user.id, email: user.email, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select('id, email, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as UserRow;
}
