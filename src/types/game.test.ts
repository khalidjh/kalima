import { describe, expect, it } from 'vitest';
import type { ComponentType } from 'react';
import type { Letter, GameDefinition, ProgressMap } from './game';

describe('game types', () => {
  it('Letter requires char, name, audio_key', () => {
    const l: Letter = { char: 'ا', name: 'alif', audio_key: 'alif' };
    expect(l.char).toBe('ا');
    expect(l.name).toBe('alif');
    expect(l.audio_key).toBe('alif');
  });

  it('ProgressMap maps level_index to stars 1-3', () => {
    const p: ProgressMap = new Map([[0, 3], [1, 2]]);
    expect(p.get(0)).toBe(3);
    expect(p.get(1)).toBe(2);
  });

  it('GameDefinition has id, nameKey, Component', () => {
    const Comp: ComponentType = () => null;
    const g: GameDefinition = { id: 'x', nameKey: 'game.x', Component: Comp };
    expect(g.id).toBe('x');
    expect(g.nameKey).toBe('game.x');
    expect(g.Component).toBe(Comp);
  });
});
