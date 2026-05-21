import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      profile: null,
      learnLang: null,
      uiLang: 'ar',
      ageGroup: null,
      isPremium: false,
    });
  });

  it('has correct defaults', () => {
    const state = useUserStore.getState();
    expect(state.profile).toBeNull();
    expect(state.learnLang).toBeNull();
    expect(state.uiLang).toBe('ar');
    expect(state.ageGroup).toBeNull();
    expect(state.isPremium).toBe(false);
  });

  it('updates learnLang via setLearnLang', () => {
    useUserStore.getState().setLearnLang('en');
    expect(useUserStore.getState().learnLang).toBe('en');
  });

  it('updates ageGroup via setAgeGroup', () => {
    useUserStore.getState().setAgeGroup('6-8');
    expect(useUserStore.getState().ageGroup).toBe('6-8');
  });

  it('resets via reset()', () => {
    useUserStore.getState().setLearnLang('en');
    useUserStore.getState().setAgeGroup('9-12');
    useUserStore.getState().reset();
    expect(useUserStore.getState().learnLang).toBeNull();
    expect(useUserStore.getState().ageGroup).toBeNull();
  });
});
