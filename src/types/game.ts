import type { ComponentType } from 'react';

export interface Letter {
  char: string;
  name: string;
  audio_key: string;
}

export type ProgressMap = Map<number, number>; // level_index → stars (1..3)

export interface GameDefinition {
  id: string;
  nameKey: string;
  Component: ComponentType;
}
