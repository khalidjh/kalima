import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ensureProfile } from '../lib/profile';
import { useUserStore } from '../stores/userStore';

export function useAuth() {
  useEffect(() => {
    let cancelled = false;

    async function hydrate(user: User | null) {
      const store = useUserStore.getState();
      if (!user) {
        if (!store.isGuest) {
          store.reset();
        }
        return;
      }
      const row = await ensureProfile(user);
      if (cancelled) return;
      store.setProfile({
        id: row.id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
      });
      if (row.learn_lang) store.setLearnLang(row.learn_lang);
      if (row.age_group) store.setAgeGroup(row.age_group);
      store.setUiLang(row.ui_lang);
      store.setPremium(row.is_premium);
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      hydrate(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
}
