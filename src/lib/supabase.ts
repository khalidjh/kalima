import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';

export const supabase: SupabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
