import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { useDirection } from './useDirection';

describe('useDirection', () => {
  afterEach(async () => {
    await i18n.changeLanguage('ar');
  });

  it('sets html dir="rtl" and lang when language is ar', async () => {
    await act(async () => {
      await i18n.changeLanguage('ar');
    });
    renderHook(() => useDirection());
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('sets html dir="ltr" and lang when language is en', async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    renderHook(() => useDirection());
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });
});
