import { useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { useGameProgress } from '../../hooks/useGameProgress';
import { LevelSelect } from './LevelSelect';
import { Quiz } from './Quiz';
import { LevelResult } from './LevelResult';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

const PROMPTS_PER_LEVEL = 3;

type State =
  | { kind: 'select' }
  | { kind: 'playing'; levelIndex: number; promptIndex: number; mistakes: number; choices: Letter[] }
  | { kind: 'result'; levelIndex: number; stars: number };

function pickDistractors(pool: Letter[], targetIndex: number): Letter[] {
  const others = pool.filter((_, i) => i !== targetIndex);
  // Fisher-Yates partial shuffle, take first 3
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, 3);
}

function buildChoices(letters: Letter[], levelIndex: number): Letter[] {
  const target = letters[levelIndex];
  const distractors = pickDistractors(letters, levelIndex);
  const all = [target, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

function starsFor(mistakes: number): number {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

export function LetterTapSound() {
  const learnLang = useUserStore((s) => s.learnLang);
  const lang: Lang = learnLang ?? 'ar';
  const letters = lang === 'ar' ? LETTERS_AR : LETTERS_EN;
  const { progress, upsert } = useGameProgress('letter-tap-sound', lang);
  const [state, setState] = useState<State>({ kind: 'select' });

  const startLevel = (levelIndex: number) => {
    setState({
      kind: 'playing',
      levelIndex,
      promptIndex: 0,
      mistakes: 0,
      choices: buildChoices(letters, levelIndex),
    });
  };

  const onCorrect = () => {
    if (state.kind !== 'playing') return;
    const nextPrompt = state.promptIndex + 1;
    if (nextPrompt >= PROMPTS_PER_LEVEL) {
      const stars = starsFor(state.mistakes);
      void upsert(state.levelIndex, stars);
      setState({ kind: 'result', levelIndex: state.levelIndex, stars });
      return;
    }
    setState({
      ...state,
      promptIndex: nextPrompt,
      choices: buildChoices(letters, state.levelIndex),
    });
  };

  const onWrong = () => {
    if (state.kind !== 'playing') return;
    setState({ ...state, mistakes: state.mistakes + 1 });
  };

  const goBack = () => setState({ kind: 'select' });
  const replay = () => {
    if (state.kind !== 'result') return;
    startLevel(state.levelIndex);
  };
  const next = () => {
    if (state.kind !== 'result') return;
    const nextIndex = state.levelIndex + 1;
    if (nextIndex < letters.length) startLevel(nextIndex);
    else goBack();
  };

  const target = useMemo(() => {
    if (state.kind !== 'playing') return null;
    return letters[state.levelIndex];
  }, [state, letters]);

  if (state.kind === 'select') {
    return <LevelSelect letters={letters} progress={progress} onPick={startLevel} />;
  }
  if (state.kind === 'playing' && target) {
    return (
      <Quiz
        key={`${state.levelIndex}-${state.promptIndex}`}
        target={target}
        choices={state.choices}
        lang={lang}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    );
  }
  if (state.kind === 'result') {
    return (
      <LevelResult
        stars={state.stars}
        hasNext={state.levelIndex + 1 < letters.length}
        onNext={next}
        onReplay={replay}
        onBack={goBack}
      />
    );
  }
  return null;
}
