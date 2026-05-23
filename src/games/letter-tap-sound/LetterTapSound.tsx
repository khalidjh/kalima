import { useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { useGameProgress } from '../../hooks/useGameProgress';
import { LevelSelect } from './LevelSelect';
import { Quiz } from './Quiz';
import { LevelResult } from './LevelResult';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import { getChoiceCountForAge, getLevelIndicesForAge } from './config';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

const PROMPTS_PER_LEVEL = 3;

type State =
  | { kind: 'select' }
  | { kind: 'playing'; levelIndex: number; promptIndex: number; mistakes: number; choices: Letter[] }
  | { kind: 'result'; levelIndex: number; stars: number };

function pickDistractors(
  letters: Letter[],
  poolIndices: number[],
  targetIndex: number,
  count: number,
): Letter[] {
  const others = poolIndices.filter((i) => i !== targetIndex).map((i) => letters[i]);
  // Fisher-Yates partial shuffle, take first `count`
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others.slice(0, count);
}

function buildChoices(
  letters: Letter[],
  poolIndices: number[],
  levelIndex: number,
  choiceCount: number,
): Letter[] {
  const target = letters[levelIndex];
  const distractors = pickDistractors(letters, poolIndices, levelIndex, choiceCount - 1);
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
  const ageGroup = useUserStore((s) => s.ageGroup);
  const lang: Lang = learnLang ?? 'ar';
  const letters = lang === 'ar' ? LETTERS_AR : LETTERS_EN;
  const levelIndices = useMemo(
    () => getLevelIndicesForAge(lang, ageGroup),
    [lang, ageGroup],
  );
  const choiceCount = getChoiceCountForAge(ageGroup);
  const { progress, upsert } = useGameProgress('letter-tap-sound', lang);
  const [state, setState] = useState<State>({ kind: 'select' });

  const startLevel = (levelIndex: number) => {
    setState({
      kind: 'playing',
      levelIndex,
      promptIndex: 0,
      mistakes: 0,
      choices: buildChoices(letters, levelIndices, levelIndex, choiceCount),
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
      choices: buildChoices(letters, levelIndices, state.levelIndex, choiceCount),
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
    const currentPos = levelIndices.indexOf(state.levelIndex);
    if (currentPos < 0) return;
    const nextPos = currentPos + 1;
    if (nextPos < levelIndices.length) startLevel(levelIndices[nextPos]);
    else goBack();
  };

  const target = useMemo(() => {
    if (state.kind !== 'playing') return null;
    return letters[state.levelIndex];
  }, [state, letters]);

  if (state.kind === 'select') {
    return (
      <LevelSelect
        letters={letters}
        levelIndices={levelIndices}
        progress={progress}
        onPick={startLevel}
      />
    );
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
    const currentPos = levelIndices.indexOf(state.levelIndex);
    const hasNext = currentPos >= 0 && currentPos + 1 < levelIndices.length;
    return (
      <LevelResult
        stars={state.stars}
        hasNext={hasNext}
        onNext={next}
        onReplay={replay}
        onBack={goBack}
      />
    );
  }
  return null;
}
