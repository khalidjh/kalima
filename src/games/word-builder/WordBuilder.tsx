import { useMemo } from 'react';
import { useUserStore } from '../../stores/userStore';
import { LevelGrid, LevelResult, useGameShell } from '../_engine';
import { SpellPad } from './SpellPad';
import { WORDS_EN } from './data/words-en';
import { getLevelIndicesForAge, getPlayConfigForAge } from './config';
import type { AgeGroup } from '../../stores/userStore';

export function WordBuilder() {
  const ageGroup = useUserStore((s) => s.ageGroup);

  const poolForAge = useMemo(
    () => (age: AgeGroup | null) => getLevelIndicesForAge(age),
    [],
  );

  const shell = useGameShell({
    gameId: 'word-builder',
    lang: 'en',
    ageGroup,
    poolForAge,
  });

  const playConfig = getPlayConfigForAge(ageGroup);

  if (shell.state.kind === 'select') {
    return (
      <LevelGrid
        levelIndices={shell.levelIndices}
        progress={shell.progress}
        onPick={shell.startLevel}
        ariaLabelFor={(i) => WORDS_EN[i].text}
        renderCard={(i) => (
          <span className="font-display font-black text-2xl text-ink">{WORDS_EN[i].text}</span>
        )}
      />
    );
  }

  if (shell.state.kind === 'playing') {
    return (
      <SpellPad
        key={shell.state.levelIndex}
        word={WORDS_EN[shell.state.levelIndex]}
        config={playConfig}
        onComplete={shell.completeLevel}
      />
    );
  }

  if (shell.state.kind === 'result') {
    return (
      <LevelResult
        stars={shell.state.stars}
        hasNext={shell.hasNext}
        onNext={shell.next}
        onReplay={shell.replay}
        onBack={shell.goBack}
      />
    );
  }

  return null;
}
