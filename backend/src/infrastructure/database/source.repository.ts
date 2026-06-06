import { SupabaseAdapter } from './supabase.adapter.js';

export interface SourceRow {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  display_name: string;
  is_active: boolean;
  recurrence_interval: string;
  config: Record<string, unknown>;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

const COLUMNS =
  'id, user_id, type, provider, display_name, is_active, recurrence_interval, config, last_fetched_at, created_at, updated_at';

export interface CreateSourceInput {
  user_id: string;
  type: string;
  provider: string;
  display_name: string;
  config: Record<string, unknown>;
  recurrence_interval?: string;
}

export async function createSource(input: CreateSourceInput): Promise<SourceRow> {
  // Omit recurrence_interval when not provided so the column default ('1 hour') applies.
  const row: Record<string, unknown> = { ...input };
  if (input.recurrence_interval === undefined) delete row.recurrence_interval;

  const { data, error } = await SupabaseAdapter.getInstance()
    .from('sources')
    .insert(row)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data as SourceRow;
}

export async function listSourcesForUser(userId: string): Promise<SourceRow[]> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('sources')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SourceRow[];
}

export async function getSourceForUser(userId: string, id: string): Promise<SourceRow | null> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('sources')
    .select(COLUMNS)
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as SourceRow) ?? null;
}

export interface UpdateSourcePatch {
  display_name?: string;
  config?: Record<string, unknown>;
  recurrence_interval?: string;
  is_active?: boolean;
}

export async function updateSource(userId: string, id: string, patch: UpdateSourcePatch): Promise<SourceRow | null> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('sources')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return (data as SourceRow) ?? null;
}

/** Delete a source the user owns. Returns true if a row was removed. */
export async function deleteSource(userId: string, id: string): Promise<boolean> {
  const { data, error } = await SupabaseAdapter.getInstance()
    .from('sources')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id');

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
