import { useMemo, useState } from 'react';
import { useGameProgress } from '../../hooks/useGameProgress';
import { starsFor } from './stars';
import type { ShellState, UseGameShellArgs, UseGameShellResult } from './types';

export function useGameShell({
  gameId,
  lang,
  ageGroup,
  poolForAge,
}: UseGameShellArgs): UseGameShellResult {
  const { progress, loading, upsert } = useGameProgress(gameId, lang);
  const [state, setState] = useState<ShellState>({ kind: 'select' });

  const levelIndices = useMemo(() => poolForAge(ageGroup), [poolForAge, ageGroup]);

  const startLevel = (levelIndex: number) => {
    setState({ kind: 'playing', levelIndex });
  };

  const completeLevel = (mistakes: number) => {
    if (state.kind !== 'playing') return;
    const stars = starsFor(mistakes);
    void upsert(state.levelIndex, stars);
    setState({ kind: 'result', levelIndex: state.levelIndex, stars });
  };

  const goBack = () => setState({ kind: 'select' });

  const next = () => {
    if (state.kind !== 'result') return;
    const pos = levelIndices.indexOf(state.levelIndex);
    if (pos < 0) return;
    const nextPos = pos + 1;
    if (nextPos < levelIndices.length) startLevel(levelIndices[nextPos]);
    else goBack();
  };

  const replay = () => {
    if (state.kind !== 'result') return;
    startLevel(state.levelIndex);
  };

  const hasNext =
    state.kind === 'result' &&
    (() => {
      const pos = levelIndices.indexOf(state.levelIndex);
      return pos >= 0 && pos + 1 < levelIndices.length;
    })();

  return {
    state,
    progress,
    loading,
    levelIndices,
    startLevel,
    completeLevel,
    next,
    replay,
    goBack,
    hasNext,
  };
}
