import { supabase } from './supabase';

describe('supabase client', () => {
  it('exposes auth and from()', () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});
