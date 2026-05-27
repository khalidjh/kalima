import { useMemo, useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { LevelSelect } from './LevelSelect';
import { Quiz } from './Quiz';
import { LevelResult, useGameShell } from '../_engine';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';
import { getChoiceCountForAge, getLevelIndicesForAge } from './config';
import type { Letter } from '../../types/game';
import type { Lang } from '../../stores/userStore';

const PROMPTS_PER_LEVEL = 3;

function pickDistractors(
  letters: Letter[],
  poolIndices: number[],
  targetIndex: number,
  count: number,
): Letter[] {
  const others = poolIndices.filter((i) => i !== targetIndex).map((i) => letters[i]);
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

interface PromptState {
  promptIndex: number;
  mistakes: number;
  choices: Letter[];
}

export function LetterTapSound() {
  const learnLang = useUserStore((s) => s.learnLang);
  const ageGroup = useUserStore((s) => s.ageGroup);
  const lang: Lang = learnLang ?? 'ar';
  const letters = lang === 'ar' ? LETTERS_AR : LETTERS_EN;
  const choiceCount = getChoiceCountForAge(ageGroup);

  const poolForAge = useMemo(
    () => (age: typeof ageGroup) => getLevelIndicesForAge(lang, age),
    [lang],
  );

  const shell = useGameShell({
    gameId: 'letter-tap-sound',
    lang,
    ageGroup,
    poolForAge,
  });

  // Per-level prompt state. We adjust state during render when the playing
  // level changes — the React-sanctioned alternative to a useEffect setState
  // (which `react-hooks/set-state-in-effect` forbids) and to the
  // useMemo-as-setter pattern. See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const playingIndex = shell.state.kind === 'playing' ? shell.state.levelIndex : null;
  const [prompt, setPrompt] = useState<PromptState | null>(null);
  const [lastPlayingIndex, setLastPlayingIndex] = useState<number | null>(null);
  if (playingIndex !== lastPlayingIndex) {
    setLastPlayingIndex(playingIndex);
    if (playingIndex === null) {
      setPrompt(null);
    } else {
      setPrompt({
        promptIndex: 0,
        mistakes: 0,
        choices: buildChoices(letters, shell.levelIndices, playingIndex, choiceCount),
      });
    }
  }

  const onCorrect = () => {
    if (!prompt || shell.state.kind !== 'playing') return;
    const nextPrompt = prompt.promptIndex + 1;
    if (nextPrompt >= PROMPTS_PER_LEVEL) {
      shell.completeLevel(prompt.mistakes);
      return;
    }
    setPrompt({
      promptIndex: nextPrompt,
      mistakes: prompt.mistakes,
      choices: buildChoices(letters, shell.levelIndices, shell.state.levelIndex, choiceCount),
    });
  };

  const onWrong = () => {
    if (!prompt) return;
    setPrompt({ ...prompt, mistakes: prompt.mistakes + 1 });
  };

  if (shell.state.kind === 'select') {
    return (
      <LevelSelect
        letters={letters}
        levelIndices={shell.levelIndices}
        progress={shell.progress}
        onPick={shell.startLevel}
      />
    );
  }

  if (shell.state.kind === 'playing' && prompt) {
    const target = letters[shell.state.levelIndex];
    return (
      <Quiz
        key={`${shell.state.levelIndex}-${prompt.promptIndex}`}
        target={target}
        choices={prompt.choices}
        lang={lang}
        onCorrect={onCorrect}
        onWrong={onWrong}
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
