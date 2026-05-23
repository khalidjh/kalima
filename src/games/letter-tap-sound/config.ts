import type { AgeGroup, Lang } from '../../stores/userStore';
import { LETTERS_AR } from './data/letters-ar';
import { LETTERS_EN } from './data/letters-en';

const allIndices = (length: number): number[] =>
  Array.from({ length }, (_, i) => i);

export const LEVEL_INDICES_FOR_AGE: Record<Lang, Record<AgeGroup, number[]>> = {
  ar: {
    '3-4': [0, 1, 2, 7, 11, 22, 23, 24], // ا ب ت د س ل م ن
    '5-7': allIndices(LETTERS_AR.length),
    '8-10': allIndices(LETTERS_AR.length),
  },
  en: {
    '3-4': [0, 3, 8, 12, 13, 15, 18, 19], // A D I M N P S T
    '5-7': allIndices(LETTERS_EN.length),
    '8-10': allIndices(LETTERS_EN.length),
  },
};

export const CHOICES_FOR_AGE: Record<AgeGroup, number> = {
  '3-4': 2,
  '5-7': 4,
  '8-10': 6,
};

export const DEFAULT_CHOICE_COUNT = 4;

export function getLevelIndicesForAge(
  lang: Lang,
  age: AgeGroup | null,
): number[] {
  if (age === null) {
    return allIndices(lang === 'ar' ? LETTERS_AR.length : LETTERS_EN.length);
  }
  return LEVEL_INDICES_FOR_AGE[lang][age];
}

export function getChoiceCountForAge(age: AgeGroup | null): number {
  return age === null ? DEFAULT_CHOICE_COUNT : CHOICES_FOR_AGE[age];
}
