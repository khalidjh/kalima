import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { Lang } from '../stores/userStore';
import type { ProgressMap } from '../types/game';
import { loadGuestProgress, saveGuestProgress } from '../lib/guestProgress';

interface Row {
  level_index: number;
  stars: number;
}

export interface UseGameProgress {
  progress: ProgressMap;
  loading: boolean;
  error: string | null;
  upsert: (levelIndex: number, stars: number) => Promise<void>;
}

export function useGameProgress(gameId: string, lang: Lang): UseGameProgress {
  const profileId = useUserStore((s) => s.profile?.id) ?? null;
  const isGuest = useUserStore((s) => s.isGuest);
  const fetchKey = profileId === null ? null : `${profileId}|${gameId}|${lang}`;

  // Supabase-backed state (used only when !isGuest)
  const [supabaseProgress, setSupabaseProgress] = useState<ProgressMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  // Guest-backed state: derive from localStorage during render. Bumping
  // guestVersion re-runs the memo after an upsert writes to localStorage.
  const [guestVersion, setGuestVersion] = useState(0);
  const guestProgress = useMemo<ProgressMap>(() => {
    // guestVersion is read here so it counts as a memo dependency — bumping
    // it after an upsert forces a fresh read from localStorage.
    void guestVersion;
    if (!isGuest || profileId === null) return new Map();
    return loadGuestProgress(gameId, lang);
  }, [isGuest, profileId, gameId, lang, guestVersion]);

  const progress = isGuest ? guestProgress : supabaseProgress;
  const loading = !isGuest && fetchKey !== null && fetchedKey !== fetchKey;

  useEffect(() => {
    if (!profileId || fetchKey === null || isGuest) return;

    let cancelled = false;
    supabase
      .from('game_progress')
      .select('level_index, stars')
      .eq('profile_id', profileId)
      .eq('game_id', gameId)
      .eq('lang', lang)
      .then(({ data, error: err }: { data: Row[] | null; error: Error | null }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setSupabaseProgress(new Map());
        } else {
          const map: ProgressMap = new Map();
          for (const row of data ?? []) map.set(row.level_index, row.stars);
          setSupabaseProgress(map);
          setError(null);
        }
        setFetchedKey(fetchKey);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, gameId, lang, fetchKey, isGuest]);

  const upsert = useCallback(
    async (levelIndex: number, stars: number) => {
      if (!profileId) return;
      const existing = progress.get(levelIndex) ?? 0;
      if (stars <= existing) return;

      if (isGuest) {
        saveGuestProgress(gameId, lang, levelIndex, stars);
        setGuestVersion((v) => v + 1);
        return;
      }

      const { error: err } = await supabase.from('game_progress').upsert(
        {
          profile_id: profileId,
          game_id: gameId,
          lang,
          level_index: levelIndex,
          stars,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id,game_id,lang,level_index' },
      );
      if (err) {
        setError(err.message);
        return;
      }
      setSupabaseProgress((prev) => {
        const next = new Map(prev);
        next.set(levelIndex, stars);
        return next;
      });
    },
    [profileId, gameId, lang, progress, isGuest],
  );

  return { progress, loading, error, upsert };
}
