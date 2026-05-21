import { useSoundStore } from './soundStore';

describe('soundStore', () => {
  beforeEach(() => {
    useSoundStore.setState({ muted: false });
  });

  it('defaults to unmuted', () => {
    expect(useSoundStore.getState().muted).toBe(false);
  });

  it('toggles via toggle()', () => {
    useSoundStore.getState().toggle();
    expect(useSoundStore.getState().muted).toBe(true);
    useSoundStore.getState().toggle();
    expect(useSoundStore.getState().muted).toBe(false);
  });

  it('sets muted via setMuted()', () => {
    useSoundStore.getState().setMuted(true);
    expect(useSoundStore.getState().muted).toBe(true);
  });
});
