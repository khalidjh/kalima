import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { Lang } from '../stores/userStore';
import type { ProgressMap } from '../types/game';

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
  const fetchKey = profileId === null ? null : `${profileId}|${gameId}|${lang}`;
  const [progress, setProgress] = useState<ProgressMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  // Derived: loading whenever we have a fetch target whose result hasn't landed yet.
  const loading = fetchKey !== null && fetchedKey !== fetchKey;

  useEffect(() => {
    if (!profileId || fetchKey === null) return;
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
          setProgress(new Map());
        } else {
          const map: ProgressMap = new Map();
          for (const row of data ?? []) map.set(row.level_index, row.stars);
          setProgress(map);
          setError(null);
        }
        setFetchedKey(fetchKey);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, gameId, lang, fetchKey]);

  const upsert = useCallback(
    async (levelIndex: number, stars: number) => {
      if (!profileId) return;
      const existing = progress.get(levelIndex) ?? 0;
      if (stars <= existing) return;
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
      setProgress((prev) => {
        const next = new Map(prev);
        next.set(levelIndex, stars);
        return next;
      });
    },
    [profileId, gameId, lang, progress],
  );

  return { progress, loading, error, upsert };
}
