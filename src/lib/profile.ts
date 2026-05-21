import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AgeGroup, Lang } from '../stores/userStore';

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age_group: AgeGroup | null;
  learn_lang: Lang | null;
  ui_lang: Lang;
  is_premium: boolean;
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function ensureProfile(user: User): Promise<ProfileRow> {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const row: ProfileRow = {
    id: user.id,
    display_name: typeof meta.full_name === 'string' ? meta.full_name : null,
    avatar_url: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
    age_group: null,
    learn_lang: null,
    ui_lang: 'ar',
    is_premium: false,
  };
  const { error } = await supabase.from('profiles').insert(row);
  if (error) throw error;
  return row;
}

export async function updateProfile(userId: string, patch: Partial<ProfileRow>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export function isProfileComplete(p: ProfileRow): boolean {
  return p.learn_lang !== null && p.age_group !== null;
}
