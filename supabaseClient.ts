import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates and returns a new Supabase client instance.
 * @param url The Supabase project URL.
 * @param key The Supabase public anon key.
 * @returns A new SupabaseClient instance.
 */
export const createSupabaseClient = (url: string, key: string): SupabaseClient => {
  return createClient(url, key);
};
