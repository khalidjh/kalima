import { describe, expect, it } from 'vitest';
import { isProfileComplete, type ProfileRow } from './profile';

const base: ProfileRow = {
  id: 'u1',
  display_name: 'A',
  avatar_url: null,
  age_group: null,
  learn_lang: null,
  ui_lang: 'ar',
  is_premium: false,
};

describe('isProfileComplete', () => {
  it('returns false when learn_lang missing', () => {
    expect(isProfileComplete({ ...base, age_group: '3-5' })).toBe(false);
  });
  it('returns false when age_group missing', () => {
    expect(isProfileComplete({ ...base, learn_lang: 'ar' })).toBe(false);
  });
  it('returns true when both set', () => {
    expect(isProfileComplete({ ...base, learn_lang: 'ar', age_group: '3-5' })).toBe(true);
  });
});
